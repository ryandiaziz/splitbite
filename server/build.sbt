name := """splitbite-server"""
organization := "com.splitbite"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "3.3.3"

libraryDependencies += guice
libraryDependencies += "io.lettuce" % "lettuce-core" % "6.3.2.RELEASE"
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.0" % Test
