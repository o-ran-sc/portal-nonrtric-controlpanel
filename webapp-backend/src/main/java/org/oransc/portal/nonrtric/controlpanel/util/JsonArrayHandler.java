package org.oransc.portal.nonrtric.controlpanel.util;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import java.util.ArrayList;
import java.util.List;

public class JsonArrayHandler {

    public static com.google.gson.Gson gson = new GsonBuilder().create();

    public static <T> List<T> parseJsonArray(String jsonString, Class<T> clazz) {
        List<T> result = new ArrayList<>();
        JsonArray jsonArr = JsonParser.parseString(jsonString).getAsJsonArray();
        for (JsonElement jsonElement : jsonArr) {
            T json = gson.fromJson(jsonElement.toString(), clazz);
            result.add(json);
        }
        return result;
    }
}
