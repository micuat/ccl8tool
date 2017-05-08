import javax.script.ScriptEngineManager;
import javax.script.ScriptEngine;
import javax.script.ScriptContext;
import javax.script.ScriptException;
import javax.script.Invocable;

import java.lang.NoSuchMethodException;
import java.lang.reflect.*;

import java.util.ArrayList;
import java.util.List;

import java.io.IOException;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

import oscP5.*;
import netP5.*;

OscP5 oscP5;

private static ScriptEngineManager engineManager;
private static ScriptEngine nashorn;

public static String VERSION = "0.1";

private static String scriptPath;
private static boolean first = true;

void setup() {
  size(1200, 1200, P3D);
  frameRate(60);

  oscP5 = new OscP5(this,5000);

  scriptPath = dataPath("code.js");

  engineManager = new ScriptEngineManager();
  nashorn = engineManager.getEngineByName("nashorn");

  try {
    Object global = nashorn.eval("this");
    Object jsObject = nashorn.eval("Object");
    // calling Object.bindProperties(global, this);
    // which will "bind" properties of the PApplet object
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", global, (PApplet)this);
    nashorn.eval("function define(varname, val){if(typeof this[varname] == 'undefined')this[varname] = val;}");
  }
  catch (Exception e) {
    e.printStackTrace();
  }

  background(0);
}

FloatList pathX = new FloatList();
FloatList pathY = new FloatList();

void draw() {
  String jsCode = "";
  try {
    jsCode = readFile(scriptPath);
  }
  catch (IOException e) {
    text(e.getMessage(), 20, 30);
    e.printStackTrace();
  }
  stroke(255);
  //text(jsCode, 20, 30);

  if (first) {
    //text("OPENED: "+scriptPath, 20, 90); 
    first = false;
  }
  try {
    nashorn.eval("var orth = " + (orth?"true":"false"));
    nashorn.eval("var path = [];");
    for(int i = 0; i < pathX.size(); i++) {
      nashorn.eval("path.push({x:"+str(pathX.get(i))+",y:"+str(pathY.get(i))+"});");
    }
    nashorn.eval(jsCode);
  }
  catch (ScriptException e) {
    //text(e.getMessage(), 20, 30);
    e.printStackTrace();
  }
}

void oscEvent(OscMessage theOscMessage) {
  /* check if theOscMessage has the address pattern we are looking for. */
  
  if(theOscMessage.checkAddrPattern("/bci_art/svm/prediction")==true) {
  } 
  //println("### received an osc message. with address pattern "+theOscMessage.addrPattern());
}

private static long prevModified = 0;
private static byte[] encoded;
public static String readFile(String path) throws IOException {
  long lastModified = Files.getLastModifiedTime(Paths.get(path)).toMillis();
  if (prevModified < lastModified || encoded == null) {
    encoded = Files.readAllBytes(Paths.get(path));
    println("updated at " + lastModified);
    prevModified = lastModified;
  }
  return new String(encoded, StandardCharsets.UTF_8);
}

boolean orth = false;
void keyPressed() {
  orth = !orth;
  //saveFrame("line-######.png");
}

void mousePressed() {
  pathX.clear();
  pathY.clear();
  pathX.append(mouseX - width*0.5f);
  pathY.append(mouseY - height*0.5f);
}

void mouseDragged() {
  pathX.append(mouseX - width*0.5f);
  pathY.append(mouseY - height*0.5f);
}

void mouseReleased() {
  pathX.append(mouseX - width*0.5f);
  pathY.append(mouseY - height*0.5f);
}