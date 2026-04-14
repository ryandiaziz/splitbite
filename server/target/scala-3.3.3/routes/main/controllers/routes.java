// @GENERATOR:play-routes-compiler
// @SOURCE:conf/routes

package controllers;

import router.RoutesPrefix;

public class routes {
  
  public static final controllers.ReverseHomeController HomeController = new controllers.ReverseHomeController(RoutesPrefix.byNamePrefix());
  public static final controllers.ReverseRoomController RoomController = new controllers.ReverseRoomController(RoutesPrefix.byNamePrefix());
  public static final controllers.ReverseWebSocketController WebSocketController = new controllers.ReverseWebSocketController(RoutesPrefix.byNamePrefix());

  public static class javascript {
    
    public static final controllers.javascript.ReverseHomeController HomeController = new controllers.javascript.ReverseHomeController(RoutesPrefix.byNamePrefix());
    public static final controllers.javascript.ReverseRoomController RoomController = new controllers.javascript.ReverseRoomController(RoutesPrefix.byNamePrefix());
    public static final controllers.javascript.ReverseWebSocketController WebSocketController = new controllers.javascript.ReverseWebSocketController(RoutesPrefix.byNamePrefix());
  }

}
