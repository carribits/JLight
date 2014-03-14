package org.stock;

import java.util.ArrayList;

public class WidgetData {

	private static WidgetData instance = null;
	public ArrayList<String> name = new ArrayList<String>();
	public String Title = "Daily";
	public String Desc = "Stocks Traded";

	protected WidgetData() {
		// Exists only to defeat instantiation.
	}

	public static WidgetData getInstance() {
		if (instance == null) {
			instance = new WidgetData();
		}
		return instance;
	}

	public String getName() {
		String myName = "Chintan Khetiya";
		return myName;
	}

	public ArrayList<String> getNameformarray() {
		name.add("Android");
		name.add("IPhone");
		name.add("Windows");
		return name;
	}

}