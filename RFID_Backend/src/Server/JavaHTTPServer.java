package Server;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import uhf.reader;

import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import com.google.gson.*;

class JavaHTTPServer {

	public static void main(String[] args) {
        try {
            HttpServer httpServer = HttpServer.create(new InetSocketAddress(8000), 0);
            httpServer.createContext("/scan", new MyHttpHandler());
            httpServer.setExecutor(null);
            httpServer.start();
        } catch (IOException ex) {
            Logger.getLogger(JavaHTTPServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
     
    static class MyHttpHandler implements HttpHandler{
 
        @Override
        public void handle(HttpExchange he) throws IOException {
            int responseCode_OK = 200;
            // when you get a request, run daniels code
            // read scanned data
            // parse arrayList to JSON File
            // set response to JSON

            // read tags
            ArrayList<String> mylist = reader.scan();
            
            // check database

           ArrayList<ArrayList<String>> items = SelectApp.selectAll(mylist);
            
           // send JSON
            
            // convert arraylist to JSON
            String response= new Gson().toJson(items);

            System.out.println("JSONObject :: " + response);
            
            // String response = "Hello from java-buddy";
            he.sendResponseHeaders(responseCode_OK, response.length());
             
            OutputStream outputStream = he.getResponseBody();
            outputStream.write(response.getBytes());
            outputStream.close();
             
            //try-with-resources form
            /*
            try (OutputStream outputStream = he.getResponseBody()) {
                outputStream.write(response.getBytes());
            }
            */
 
        }
         
    }	
    
//    public static void convertArrayListToJsonObject(){
//
//        ArrayList<String> mylist = new ArrayList<String> ();
//
//        mylist.add("abc");
//        mylist.add("cde");
//        mylist.add("fgh");
//        mylist.add("jkl");
//        mylist.add("mno");
//
//        String json = new Gson().toJson(mylist);
//
//        System.out.println("JSONObject :: " + json);
//        
//    }
    
    
    
//    public static void main(String[] args) throws Exception {
//        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
//        server.createContext("/test", new ScanHandler());
//        server.setExecutor(null); // creates a default executor
//        server.start();
//    }
//
//    static class ScanHandler implements HttpHandler {
//        @Override
//        public void handle(HttpExchange t) throws IOException {
//            String response = "This is the response fuck yes";
//            t.sendResponseHeaders(200, response.length());
//            OutputStream os = t.getResponseBody();
//            os.write(response.getBytes());
//            os.close();
//        }
//    }

}