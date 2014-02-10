function calculo() 
{	
	a=($("#VA").val()>0)?$("#VA").val():0;
	b=($("#VB").val()>0)?$("#VB").val():0;
	c=($("#VC").val()>0)?$("#VC").val():0;
	d=($("#VD").val()>0)?$("#VD").val():0;
	ts=($("#VT").val()>0)?$("#VT").val():0;
	
	a*=ts;
	b*=ts;
	c*=ts;
	d*=ts;
	
	ad=Math.exp(a);
	bd=(b/a-c)*(Math.exp(a)- Math.exp(c));
	cd=0;
	dd=Math.exp(d);
	$("#ValorAd").html(ad);
	$("#ValorBd").html(bd);
}