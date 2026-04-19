package actors

import org.apache.pekko.actor._

import play.api.libs.json._
import services.RedisService
import models._

object ClientActor {
  def props(roomId: String, sessionId: String, out: ActorRef, manager: ActorRef, redisService: RedisService): Props = 
    Props(new ClientActor(roomId, sessionId, out, manager, redisService))
}

class ClientActor(roomId: String, sessionId: String, out: ActorRef, manager: ActorRef, redisService: RedisService) extends Actor {
  import models.RoomFormats._

  override def preStart(): Unit = {
    manager ! RoomManagerActor.Join(roomId, out)
  }

  override def postStop(): Unit = {
    manager ! RoomManagerActor.Leave(roomId, out)
  }

  def receive: Receive = {
    case input: String =>
      try {
        val json = Json.parse(input)
        val msgType = (json \ "type").asOpt[String]
        val data = (json \ "data").asOpt[JsObject].getOrElse(Json.obj())
        
        redisService.get(s"room:$roomId").foreach { roomStr =>
          Json.parse(roomStr).validate[Room].fold(
            errors => (),
            room => {
              var updatedRoom = room

              msgType match {
                case Some("JOIN_PARTICIPANT") =>
                  val name = (data \ "name").asOpt[String].getOrElse("Guest")
                  if (!room.participants.exists(_.sessionId == sessionId)) {
                    val isApproved = room.hostId == sessionId
                    val p = Participant(java.util.UUID.randomUUID().toString.take(6), name, sessionId, "pending", isApproved, false, None, List.empty)
                    updatedRoom = room.copy(participants = room.participants :+ p)
                  }

                case Some("APPROVE_PARTICIPANT") =>
                  if (room.hostId == sessionId) {
                    val targetSessionId = (data \ "targetSessionId").as[String]
                    val pIndex = room.participants.indexWhere(_.sessionId == targetSessionId)
                    if (pIndex >= 0) {
                      updatedRoom = room.copy(
                        participants = room.participants.updated(pIndex, room.participants(pIndex).copy(isApproved = true))
                      )
                    }
                  }

                case Some("REJECT_PARTICIPANT") =>
                  if (room.hostId == sessionId) {
                    val targetSessionId = (data \ "targetSessionId").as[String]
                    val pIndex = room.participants.indexWhere(_.sessionId == targetSessionId)
                    if (pIndex >= 0) {
                      updatedRoom = room.copy(
                        participants = room.participants.updated(pIndex, room.participants(pIndex).copy(isRejected = true))
                      )
                    }
                  }

                case Some("ADD_ORDER") =>
                  val participant = room.participants.find(_.sessionId == sessionId)
                  if (!room.isOrderLocked && participant.exists(_.isApproved)) {
                    val itemName = (data \ "name").as[String]
                    val price = (data \ "price").asOpt[Double].getOrElse(0.0)
                    val quantity = (data \ "quantity").asOpt[Int].getOrElse(1)
                    val note = (data \ "note").asOpt[String].filter(_.trim.nonEmpty)
                    val newOrder = Order(java.util.UUID.randomUUID().toString.take(8), sessionId, itemName, price, quantity, note)

                    val pIndex = room.participants.indexWhere(_.sessionId == sessionId)
                    if (pIndex >= 0) {
                      val p = room.participants(pIndex)
                      val updatedParticipants = room.participants.updated(pIndex, p.copy(orders = p.orders :+ newOrder))
                      updatedRoom = room.copy(participants = updatedParticipants)
                    }
                  }

                case Some("UPDATE_ORDER") =>
                  if (room.hostId == sessionId) {
                    val orderId = (data \ "orderId").as[String]
                    val newPrice = (data \ "price").asOpt[Double]
                    val newQuantity = (data \ "quantity").asOpt[Int]
                    val newName = (data \ "name").asOpt[String]

                    val updatedParticipants = room.participants.map { p =>
                      val oIndex = p.orders.indexWhere(_.id == orderId)
                      if (oIndex >= 0) {
                        val o = p.orders(oIndex)
                        val updatedOrder = o.copy(
                          price = newPrice.getOrElse(o.price),
                          quantity = newQuantity.getOrElse(o.quantity),
                          itemName = newName.getOrElse(o.itemName)
                        )
                        p.copy(orders = p.orders.updated(oIndex, updatedOrder))
                      } else p
                    }
                    updatedRoom = room.copy(participants = updatedParticipants)
                  }

                case Some("UPLOAD_RECEIPT") =>
                  val base64 = (data \ "receipt").asOpt[String]
                  val pIndex = room.participants.indexWhere(_.sessionId == sessionId)
                  if (pIndex >= 0) {
                    val p = room.participants(pIndex)
                    val updatedParticipants = room.participants.updated(pIndex, p.copy(paymentStatus = "paid", receiptImageUrl = base64))
                    updatedRoom = room.copy(participants = updatedParticipants)
                  }

                case Some("CONFIRM_PAYMENT") =>
                  if (room.hostId == sessionId) {
                    val targetSessionId = (data \ "targetSessionId").as[String]
                    val pIndex = room.participants.indexWhere(_.sessionId == targetSessionId)
                    if (pIndex >= 0) {
                      val p = room.participants(pIndex)
                      val updatedParticipants = room.participants.updated(pIndex, p.copy(paymentStatus = "confirmed"))
                      updatedRoom = room.copy(participants = updatedParticipants)
                    }
                  }

                case Some("UPDATE_FEES") =>
                  if (room.hostId == sessionId) {
                    val fees = (data \ "additionalFees").asOpt[Double].getOrElse(room.additionalFees)
                    val discount = (data \ "discount").asOpt[Double].getOrElse(room.discount)
                    updatedRoom = room.copy(additionalFees = fees, discount = discount)
                  }

                case Some("UPDATE_MENU") =>
                  if (room.hostId == sessionId) {
                    val menuImage = (data \ "menuImage").asOpt[String]
                    val description = (data \ "description").asOpt[String]
                    updatedRoom = room.copy(
                      menuImageUrl = menuImage.orElse(room.menuImageUrl),
                      menuDescription = description.orElse(room.menuDescription)
                    )
                  }

                case Some("UPLOAD_HOST_RECEIPT") =>
                  if (room.hostId == sessionId) {
                    val receipt = (data \ "receipt").asOpt[String]
                    updatedRoom = room.copy(hostReceiptUrl = receipt)
                  }

                case Some("TOGGLE_ORDER_LOCK") =>
                  if (room.hostId == sessionId) {
                    updatedRoom = room.copy(isOrderLocked = !room.isOrderLocked)
                  }

                case Some("CLOSE_ROOM") =>
                  if (room.hostId == sessionId) {
                    redisService.del(s"room:$roomId")
                    manager ! RoomManagerActor.Broadcast(roomId, Json.obj("type" -> "ROOM_DELETED").toString())
                  }

                case _ => // discard
              }

              if (updatedRoom != room) {
                val newJsonPayload = Json.toJson(updatedRoom).toString()
                redisService.set(s"room:$roomId", newJsonPayload)
                manager ! RoomManagerActor.Broadcast(roomId, newJsonPayload)
              }
            }
          )
        }
      } catch {
        case e: Exception => println(s"WS Parser Error: ${e.getMessage}")
      }
  }
}
