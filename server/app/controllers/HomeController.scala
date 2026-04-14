package controllers

import javax.inject._
import play.api.mvc._

@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {
  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(play.api.libs.json.Json.obj("appName" -> "SplitBite API", "status" -> "Running"))
  }
}
