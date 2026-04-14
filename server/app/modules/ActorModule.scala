package modules

import com.google.inject.AbstractModule
import play.api.libs.concurrent.PekkoGuiceSupport
import actors.RoomManagerActor

class ActorModule extends AbstractModule with PekkoGuiceSupport {
  override def configure() = {
    bindActor[RoomManagerActor]("roomManagerActor")
  }
}
