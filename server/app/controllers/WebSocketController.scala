package controllers

import javax.inject._
import play.api.mvc._
import org.apache.pekko.stream.Materializer
import org.apache.pekko.actor.{ActorSystem, ActorRef}
import play.api.libs.streams.ActorFlow
import scala.concurrent.ExecutionContext

import actors.ClientActor

import services.RedisService

@Singleton
class WebSocketController @Inject()(
  val controllerComponents: ControllerComponents,
  @Named("roomManagerActor") roomManager: ActorRef,
  redisService: RedisService
)(implicit system: ActorSystem, mat: Materializer, ec: ExecutionContext) extends BaseController {

  /**
   * Accepts WebSocket connections for a given Room ID.
   */
  def ws(id: String): WebSocket = WebSocket.accept[String, String] { request =>
    val sessionId = request.getQueryString("session_id").getOrElse("anon")
    ActorFlow.actorRef { out =>
      ClientActor.props(id, sessionId, out, roomManager, redisService)
    }
  }
}
