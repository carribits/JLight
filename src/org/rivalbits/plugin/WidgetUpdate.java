package org.stock.plugin;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stock.WidgetData;

/**
 * This class echoes a string called from JavaScript.
 */
public class WidgetUpdate extends CordovaPlugin {
	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {
		if (action.equals("update")) {
			this.update(args, callbackContext);
			return true;
		}
		return false;
	}

	private void update(JSONArray args, CallbackContext callbackContext) throws JSONException {
		String title = args.getString(0);
		String desc = args.getString(1);
		
		WidgetData widgetData = WidgetData.getInstance();
		widgetData.Title = title;
		widgetData.Desc = desc;

		callbackContext.success("");
	}
}
