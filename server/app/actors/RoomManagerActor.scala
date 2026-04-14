package actors

import org.apache.pekko.actor._
import javax.inject._
import services.RedisService
import play.api.libs.json._
import models._

object RoomManagerActor {
  case class Join(roomId: String, client: ActorRef)
  case class Leave(roomId: String, client: ActorRef)
  case class Broadcast(roomId: String, message: String)
}

@Singleton
class RoomManagerActor @Inject()(redisService: RedisService) extends Actor {
  import RoomManagerActor._

  // Stores sets of ActorRefs mapped by roomId
  var rooms = Map.empty[String, Set[ActorRef]]

  def receive: Receive = {
    case Join(roomId, client) =>
      val currentClients = rooms.getOrElse(roomId, Set.empty)
      rooms += (roomId -> (currentClients + client))
      
      // Send the latest synchronized state to the newly joined client
      redisService.get(s"room:$roomId").foreach { json =>
        client ! json
      }

    case Leave(roomId, client) =>
      val currentClients = rooms.getOrElse(roomId, Set.empty)
      rooms += (roomId -> (currentClients - client))
      if (rooms(roomId).isEmpty) {
        rooms -= roomId
      }

    case Broadcast(roomId, message) =>
      rooms.getOrElse(roomId, Set.empty).foreach { client =>
        client ! message
      }
  }
}
