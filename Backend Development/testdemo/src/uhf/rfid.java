package uhf;
import java.lang.reflect.Array;

import com.rfid.uhf.Device.*;

public class rfid {

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
		     byte maxfEU = 0b01000000;
		     byte minfEU = 0b00000000;
		     reader.SetRegion(comAddr, maxfEU, minfEU, PortHandle[0]);
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


	    	 /*byte[]PlusMinus =new byte[1];
	    	 byte[]Temperature =new byte[1];
	    	 result = reader.GetReaderTemperature(comAddr, PlusMinus, Temperature, PortHandle[0]);
	    	 System.out.println("Read temperature£º"+result);

	    	 Ant[0]=0;
	    	 byte[]TestFreq =new byte[4];//000df638 --915M
	    	 TestFreq[0] = (byte)0x00;
	    	 TestFreq[1] = (byte)0x0d;
	    	 TestFreq[2] = (byte)0xf6;
	    	 TestFreq[3] = (byte)0x38;
	    	 byte[]ReturnLoss =new byte[1];
	    	 result = reader.MeasureReturnLoss(comAddr, TestFreq, Ant[0], ReturnLoss, PortHandle[0]);
	    	 System.out.println("Read temperature: "+result);*/
	    	 ////////////////////////////////////////////////////////////////////////////
	    	 /////////////Label operation///////////////////////////////////////////////////////
	    	 ////////////////////////////////////////////////////////////////////////////
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
			 byte[]pEPCList=new byte[20000];
			 int[]Totallen=new int[1];
			 int[]CardNum=new int[1];
	    	 result = reader.Inventory_G2(comAddr,QValue,Session,MaskMem,MaskAdr,MaskLen,MaskData,MaskFlag,
	    			  AdrTID,LenTID,TIDFlag,Target,InAnt,Scantime,FastFlag,pEPCList, Ant,Totallen,
					   CardNum,PortHandle[0]);
	    	 System.out.println("Inquiry order:"+result);
	    	 if(CardNum[0]>0)
	    	 {
	    		 System.out.println("Number of labels:"+CardNum[0]);
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
	    			 int rssi = pEPCList[m++];
	    			 System.out.println("RSSI: "+rssi);
	    			 System.out.println("EPCLen: "+epclen);
	    			 System.out.println(EPCstr.toUpperCase());
	    			 //Write data according to TID number
	    			 byte ENum=(byte)255; //Mask
	    			 byte Mem=1; //Read EPC
	    			 byte WordPtr=2;//Starting from the second word
	    			 byte Num=6;//Read 6 words
	    			 byte[]Password=new byte[4];
                     MaskMem=2;//TID mask
                     MaskAdr[0]=0;
                     MaskAdr[1]=0;
                     MaskLen=96;
                     int p=0;
                     System.arraycopy(epc,0,MaskData,0,96/8);
                     byte[]Data=new byte[Num*2];
                     int[]Errorcode=new int[1];
                     byte WNum=7;
                     byte[]Wdt=new byte[WNum*2];
                     Wdt[0]=0x30;
                     Wdt[1]=0x00;//First word PC length
                     Wdt[2]=(byte)0xE2;
                     Wdt[3]=0x00;
                     Wdt[4]=0x12;
                     Wdt[5]=0x34;
                     Wdt[6]=0x56;
                     Wdt[7]=0x78;
                     Wdt[8]=0x12;
                     Wdt[9]=0x34;
                     Wdt[10]=0x56;
                     Wdt[11]=0x78;
                     Wdt[12]=0x12;
                     Wdt[13]=0x34;
                     WordPtr=1;
                     result = reader.WriteData_G2(comAddr, epc, WNum, ENum, Mem, WordPtr, Wdt, Password,
                    		 MaskMem,MaskAdr, MaskLen, MaskData, Errorcode, PortHandle[0]);
                     System.out.println("Write EPC number: "+result); //just stuff to write numbers
                     WordPtr=2;
	    			 result = reader.ReadData_G2(comAddr,epc,ENum,Mem,WordPtr,Num,Password,
		                       MaskMem,MaskAdr, MaskLen,MaskData,Data,Errorcode,PortHandle[0]);
	    			 System.out.println("Reading data "+result);
	    			 if(result==0)
	    			 {
	    				 String Memdata="";
	    				 for( p=0;p<Num*2;p++)
		    			 {
		    				 byte bbt = Data[p];
		    				 String hex= Integer.toHexString(bbt& 255);
				    		 if(hex.length()==1)
				    		 {
				    			hex="0"+hex;
				    		 }
				    		 Memdata+=hex;
		    			 }
		    			 System.out.println(Memdata+"\n");
	    			 }
	    		 }
	    	 }
	     }
	     reader.CloseSpecComPort(PortHandle[0]);
	}

}
