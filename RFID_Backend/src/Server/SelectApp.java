package Server;

import java.sql.DriverManager;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.sql.*;

public class SelectApp {
	 
    /**
     * Connect to the test.db database
     * @return the Connection object
     */
    private static Connection connect() {
        // SQLite connection string
    	 System.out.println("Working Directory = " +
                 System.getProperty("user.dir"));
        String url = "jdbc:sqlite:RFIDDatabase.db";
        Connection conn = null;
        try {
            conn = DriverManager.getConnection(url);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return conn;
    }
 
    
    /**
     * select all rows in the warehouses table
     */
    public static ArrayList<ArrayList<String>> selectAll(ArrayList<String> mylist){
        String sql = "SELECT * FROM taginventory";
    	ArrayList<ArrayList<String>> items = new ArrayList<ArrayList<String>> ();
    	
    	
        try (Connection conn = connect();
             Statement stmt  = conn.createStatement();
             ResultSet rs    = stmt.executeQuery(sql)){
        	
        	System.out.println(mylist.size());
            // loop through the result set
            while (rs.next()) {
            	ArrayList<String> item = new ArrayList<String> ();
            	//check if element in Scanned
            	if (mylist.contains(rs.getString("TID"))) {
            		System.out.println(rs.getString("Name"));
            		item.add(rs.getString("Name"));
            		item.add(rs.getString("Price"));
            		item.add(rs.getString("In Store"));
            		item.add("1");
            		if(items.contains(item)) { 
            			String value = (items.get(items.indexOf(item))).get(3);
            		    items.get(items.indexOf(item)).set(3, String.valueOf(Integer.valueOf(value)+1));
            		    }
            		else{
            			items.add(item);   
            		}
            	} else {
            		
            	}
            }
            
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return items;
    }
  
 
}
