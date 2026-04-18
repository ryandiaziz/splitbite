package services

import io.lettuce.core.RedisClient
import io.lettuce.core.api.StatefulRedisConnection
import play.api.Configuration
import javax.inject.{Inject, Singleton}
import play.api.inject.ApplicationLifecycle
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.jdk.CollectionConverters._

@Singleton
class RedisService @Inject()(config: Configuration, lifecycle: ApplicationLifecycle) {
  private val redisUrl = config.getOptional[String]("redis.url").getOrElse("redis://localhost:6379")
  val defaultTtl = config.getOptional[Duration]("splitbite.room.ttl").getOrElse(24.hours).toSeconds
  
  // Create client and sync connection
  private val client: RedisClient = RedisClient.create(redisUrl)
  private val connection: StatefulRedisConnection[String, String] = client.connect()
  private val sync = connection.sync()

  // Graceful shutdown
  lifecycle.addStopHook { () =>
    Future.successful {
      connection.close()
      client.shutdown()
    }
  }

  /**
   * Set JSON String to Redis with TTL
   */
  def set(key: String, value: String, ttlSeconds: Long = defaultTtl): Unit = {
    sync.setex(key, ttlSeconds, value)
  }

  /**
   * Get JSON String from Redis
   */
  def get(key: String): Option[String] = {
    Option(sync.get(key))
  }

  /**
   * Delete key from Redis
   */
  def del(key: String): Unit = {
    sync.del(key)
  }

  /**
   * Count keys matching a pattern
   */
  def countKeys(pattern: String): Long = {
    sync.keys(pattern).size().toLong
  }
}
