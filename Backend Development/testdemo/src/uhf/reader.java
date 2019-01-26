package uhf;
import java.lang.reflect.Array;
import java.util.ArrayList;

import com.rfid.uhf.Device.*;

public class reader {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		 System.loadLibrary("com_rfid_uhf_Device");
		 com.rfid.uhf.Device reader = new com.rfid.uhf.Device();
		 int Port = 3;//com3
	     byte[]comAddr=new byte[1];
	     comAddr[0]=(byte)255;
	     byte baud=5;//57600bps
	     int[] PortHandle= new int[1];
	     //Serial port connection
	     int result = reader.OpenComPort(3, comAddr, baud, PortHandle);
	     System.out.println("Connect the serial port:"+ result);
	     if(result==0)
	     {
	    	 byte PowerDbm = 10;
	    	 reader.SetRfPower(comAddr, PowerDbm, PortHandle[0]);
	    	 byte beep = 1;  
	    	 reader.SetBeepNotification(comAddr, beep , PortHandle[0]);
	    	 byte maxfEU = 0b01000000;
		     byte minfEU = 0b00000000;
		     System.out.println( "Setting frequency bands: " +reader.SetRegion(comAddr, maxfEU, minfEU, PortHandle[0]));
		     byte Antennas = 0b00001001; //bit 0 = antenna 1, bit 1 = antenna 2, bit 2 = antenna 3, bit 3 = antenna 4
		     System.out.println("Setting Antenna Multiplexing: " + reader.SetAntennaMultiplexing(comAddr, Antennas, PortHandle[0]));
	    	 byte[]versionInfo=new byte[2];
	    	 byte[]readerType=new byte[1];
	    	 byte[]trType=new byte[1];
	    	 byte[]dmaxfre=new byte[1];
	    	 byte[]dminfre=new byte[1];
	    	 byte[]powerdBm=new byte[1];
	    	 byte[]InventoryScanTime=new byte[1];
	    	 byte[]Ant=new byte[1];
	    	 byte[]BeepEn=new byte[1];
	    	 byte[]OutputRep=new byte[1];
	    	 byte[]CheckAnt=new byte[1];
	    	 result = reader.GetReaderInformation(comAddr, versionInfo, readerType, trType, dmaxfre, dminfre, powerdBm, InventoryScanTime,
	    			 Ant, BeepEn, OutputRep, CheckAnt, PortHandle[0]);
	    	 System.out.println("Power: "+ powerdBm[0]);
	    	 System.out.println("Get reader information:"+result);
	    	 System.out.println("Max Freq: "+ dminfre[0]);
	    	 System.out.println("Min Freq: "+ dminfre[0]);
	    	 byte ComAdrData=0;
	    	 result = reader.SetAddress(comAddr, ComAdrData, PortHandle[0]);
	    	 System.out.println("Set the reader address:"+result);
	    	 
	    	 byte QValue=5;
	    	 byte Session=0;
	    	 byte MaskMem=2;
	    	 byte[]MaskAdr=new byte[2];
	    	 byte MaskLen=0;
			 byte[]MaskData=new byte[256];
			 byte MaskFlag=0;
			 byte AdrTID=0;
			 byte LenTID=6;
			 byte TIDFlag=1;//Read the first 6 words of the TID
			 byte Target=0;
			 byte InAnt=(byte)0x80;
			 byte Scantime=0;
			 byte FastFlag=0;
			 ArrayList<String> finalEPCList = new ArrayList<String>();
			 //byte[]pEPCList=new byte[20000];
			 //int[]Totallen=new int[1];
			 //int[]CardNum=new int[1];
		     double time = System.currentTimeMillis();
			 while (System.currentTimeMillis()-time<100){
				 byte[]pEPCList = new byte[20000];
				 int[]Totallen = new int[1];
				 int[]CardNum = new int[1];
		    	 result = reader.Inventory_G2(comAddr,QValue,Session,MaskMem,MaskAdr,MaskLen,MaskData,MaskFlag,
		    			  AdrTID,LenTID,TIDFlag,Target,InAnt,Scantime,FastFlag,pEPCList, Ant,Totallen,
						   CardNum,PortHandle[0]);
		    	 //System.out.println("Inquiry order:"+result);
		    	 if(CardNum[0]>0)
		    	 {
		    		 //System.out.println("Number of labels:"+CardNum[0]);
		    		 int m=0;
		    		 for(int index=0;index<CardNum[0];index++)
		    		 {
		    			 int epclen = pEPCList[m++]&255;
		    			 String EPCstr="";
		    			 byte[]epc = new byte[epclen];
		    			 for(int n=0;n<epclen;n++)
		    			 {
		    				 byte bbt = pEPCList[m++];
		    				 epc[n] = bbt;
		    				 String hex= Integer.toHexString(bbt& 255);
				    		 if(hex.length()==1)
				    		 {
				    			hex="0"+hex;
				    		 }
				    		 EPCstr+=hex;
		    			 }
		    			 if (!finalEPCList.contains(EPCstr)) {
		    				 finalEPCList.add(EPCstr);
		    			 }
		    			 int rssi = pEPCList[m++];
		    			 //System.out.println("RSSI: "+rssi);
		    			 //System.out.println("EPCLen: "+epclen);
		    			 //System.out.println(EPCstr.toUpperCase());
	
		    		 }
		    	 }
		     }
		     System.out.println("Number of tags: " + finalEPCList.size());
		     for(int i = 0; i<finalEPCList.size();i++) {
		    	 System.out.println(finalEPCList.get(i));
		     }
	     }
	     reader.CloseSpecComPort(PortHandle[0]);
	}

}