package controllers

import javax.inject._
import play.api.mvc._
import play.api.libs.json._
import play.api.Configuration
import services.RedisService
import models._
import scala.concurrent.ExecutionContext

@Singleton
class RoomController @Inject()(val controllerComponents: ControllerComponents, redisService: RedisService, config: Configuration)(implicit ec: ExecutionContext) extends BaseController {

  import models.RoomFormats._

  /**
   * Create a new temporary room.
   * Expects JSON: { "hostId": "...", "roomType": "image" }
   */
  def createRoom() = Action { implicit request: Request[AnyContent] =>
    request.body.asJson match {
      case Some(json) =>
        val hostIdOpt = (json \ "hostId").asOpt[String]
        val roomTypeOpt = (json \ "roomType").asOpt[String]

        (hostIdOpt, roomTypeOpt) match {
          case (Some(hostId), Some(roomType)) =>
            // Check room limit
            val maxRooms = config.getOptional[Int]("splitbite.room.max_count").getOrElse(100)
            if (redisService.countKeys("room:*") >= maxRooms) {
              Status(429)(Json.obj("status" -> "error", "message" -> "Server room limit reached. Please try again later."))
            } else {
              // Generate a random room ID
              val roomId = java.util.UUID.randomUUID().toString.take(8)
              
              val newRoom = Room(
                id = roomId,
                hostId = hostId,
                roomType = roomType,
                menuImageUrl = None,
                menuDescription = None,
                hostReceiptUrl = None,
                isOrderLocked = false,
                menuItems = List.empty,
                participants = List.empty,
                additionalFees = 0.0,
                discount = 0.0
              )

              // Save to Redis
              redisService.set(s"room:$roomId", Json.toJson(newRoom).toString())

              Ok(Json.obj(
                "status" -> "success",
                "roomId" -> roomId,
                "room" -> Json.toJson(newRoom)
              ))
            }

          case _ =>
            BadRequest(Json.obj("status" -> "error", "message" -> "Missing hostId or roomType"))
        }
      case None =>
        BadRequest(Json.obj("status" -> "error", "message" -> "Expecting JSON data"))
    }
  }

  /**
   * Get an existing room by ID
   */
  def getRoom(id: String) = Action {
    redisService.get(s"room:$id") match {
      case Some(jsonString) =>
        try {
          val json = Json.parse(jsonString)
          Ok(Json.obj("status" -> "success", "room" -> json))
        } catch {
          case e: Exception => InternalServerError(Json.obj("status" -> "error", "message" -> "Corrupted data in Redis"))
        }
      case None =>
        NotFound(Json.obj("status" -> "error", "message" -> "Room not found or expired"))
    }
  }
}
