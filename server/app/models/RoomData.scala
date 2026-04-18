package models

import play.api.libs.json._

case class MenuItem(
  id: String,
  name: String,
  price: Double
)

case class Order(
  id: String,
  participantId: String,
  itemName: String,
  price: Double,
  note: Option[String]
)

case class Participant(
  id: String,
  name: String,
  sessionId: String,
  paymentStatus: String, // "pending", "verifying", "paid"
  receiptImageUrl: Option[String],
  orders: List[Order]
)

case class Room(
  id: String,
  hostId: String,
  roomType: String, // "image" or "structured"
  menuImageUrl: Option[String],
  menuDescription: Option[String],
  hostReceiptUrl: Option[String],
  isOrderLocked: Boolean,
  menuItems: List[MenuItem],
  participants: List[Participant],
  additionalFees: Double,
  discount: Double
)

object RoomFormats {
  // Play JSON explicit formats using Macros for automatic serialization
  implicit val menuItemFormat: OFormat[MenuItem] = Json.format[MenuItem]
  implicit val orderFormat: OFormat[Order] = Json.format[Order]
  implicit val participantFormat: OFormat[Participant] = Json.format[Participant]
  implicit val roomFormat: OFormat[Room] = Json.format[Room]
}
