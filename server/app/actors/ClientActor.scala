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
                    val p = Participant(java.util.UUID.randomUUID().toString.take(6), name, sessionId, "pending", None, List.empty)
                    updatedRoom = room.copy(participants = room.participants :+ p)
                  }

                case Some("ADD_ORDER") =>
                  val itemName = (data \ "name").as[String]
                  val price = (data \ "price").as[Double]
                  val note = (data \ "note").asOpt[String].filter(_.trim.nonEmpty)
                  val newOrder = Order(java.util.UUID.randomUUID().toString.take(8), sessionId, itemName, price, note)

                  val pIndex = room.participants.indexWhere(_.sessionId == sessionId)
                  if (pIndex >= 0) {
                    val p = room.participants(pIndex)
                    val updatedParticipants = room.participants.updated(pIndex, p.copy(orders = p.orders :+ newOrder))
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
