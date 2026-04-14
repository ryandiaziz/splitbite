// @GENERATOR:play-routes-compiler
// @SOURCE:conf/routes

package router

import play.core.routing._
import play.core.routing.HandlerInvokerFactory._

import play.api.mvc._

import _root_.controllers.Assets.Asset

class Routes(
  override val errorHandler: play.api.http.HttpErrorHandler, 
  // @LINE:5
  HomeController_0: controllers.HomeController,
  // @LINE:6
  RoomController_1: controllers.RoomController,
  // @LINE:8
  WebSocketController_2: controllers.WebSocketController,
  val prefix: String
) extends GeneratedRouter {

  @javax.inject.Inject()
  def this(errorHandler: play.api.http.HttpErrorHandler,
    // @LINE:5
    HomeController_0: controllers.HomeController,
    // @LINE:6
    RoomController_1: controllers.RoomController,
    // @LINE:8
    WebSocketController_2: controllers.WebSocketController
  ) = this(errorHandler, HomeController_0, RoomController_1, WebSocketController_2, "/")

  def withPrefix(addPrefix: String): Routes = {
    val prefix = play.api.routing.Router.concatPrefix(addPrefix, this.prefix)
    router.RoutesPrefix.setPrefix(prefix)
    new Routes(errorHandler, HomeController_0, RoomController_1, WebSocketController_2, prefix)
  }

  private val defaultPrefix: String = {
    if (this.prefix.endsWith("/")) "" else "/"
  }

  def documentation = List(
    ("""GET""", this.prefix, """controllers.HomeController.index()"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/room/create""", """controllers.RoomController.createRoom()"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/room/""" + "$" + """id<[^/]+>""", """controllers.RoomController.getRoom(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/room/""" + "$" + """id<[^/]+>/ws""", """controllers.WebSocketController.ws(id:String)"""),
    Nil
  ).foldLeft(Seq.empty[(String, String, String)]) { (s,e) => e.asInstanceOf[Any] match {
    case r @ (_,_,_) => s :+ r.asInstanceOf[(String, String, String)]
    case l => s ++ l.asInstanceOf[List[(String, String, String)]]
  }}


  // @LINE:5
  private lazy val controllers_HomeController_index0_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix)))
  )
  private lazy val controllers_HomeController_index0_invoker = createInvoker(
    HomeController_0.index(),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.HomeController",
      "index",
      Nil,
      "GET",
      this.prefix + """""",
      """""",
      Seq()
    )
  )

  // @LINE:6
  private lazy val controllers_RoomController_createRoom1_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/room/create")))
  )
  private lazy val controllers_RoomController_createRoom1_invoker = createInvoker(
    RoomController_1.createRoom(),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.RoomController",
      "createRoom",
      Nil,
      "POST",
      this.prefix + """api/room/create""",
      """""",
      Seq()
    )
  )

  // @LINE:7
  private lazy val controllers_RoomController_getRoom2_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/room/"), DynamicPart("id", """[^/]+""", encodeable=true)))
  )
  private lazy val controllers_RoomController_getRoom2_invoker = createInvoker(
    RoomController_1.getRoom(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.RoomController",
      "getRoom",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/room/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:8
  private lazy val controllers_WebSocketController_ws3_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/room/"), DynamicPart("id", """[^/]+""", encodeable=true), StaticPart("/ws")))
  )
  private lazy val controllers_WebSocketController_ws3_invoker = createInvoker(
    WebSocketController_2.ws(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.WebSocketController",
      "ws",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/room/""" + "$" + """id<[^/]+>/ws""",
      """""",
      Seq()
    )
  )


  def routes: PartialFunction[RequestHeader, Handler] = {
  
    // @LINE:5
    case controllers_HomeController_index0_route(params@_) =>
      call { 
        controllers_HomeController_index0_invoker.call(HomeController_0.index())
      }
  
    // @LINE:6
    case controllers_RoomController_createRoom1_route(params@_) =>
      call { 
        controllers_RoomController_createRoom1_invoker.call(RoomController_1.createRoom())
      }
  
    // @LINE:7
    case controllers_RoomController_getRoom2_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_RoomController_getRoom2_invoker.call(RoomController_1.getRoom(id))
      }
  
    // @LINE:8
    case controllers_WebSocketController_ws3_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_WebSocketController_ws3_invoker.call(WebSocketController_2.ws(id))
      }
  }
}
