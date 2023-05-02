#pragma once

// call Open AI API to get text from sound 
// https://openai.com/blog/openai-api/
// https://beta.openai.com/docs/api-reference/completions/create
// https://beta.openai.com/docs/introduction

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

class OpenAiApi {
public:
    const char* ssid = "your ssid";
    const char* password = "your password";
    // https://openai.com/research/whisper
    //curl https ://api.openai.com/v1/audio/transcriptions \
    //  -H "Authorization: Bearer $OPENAI_API_KEY" \
    //  -H "Content-Type: multipart/form-data" \
    //  -F file="@/path/to/file/audio.mp3" \
    //  -F model="whisper-1"
    int test()
    {
        printf("Starting Open AI API");
        // Connect to WiFi network
        WiFi.begin(ssid, password);
        while (WiFi.status() != WL_CONNECTED) {
            delay(100);
            printf("Connecting to WiFi..");
        }
        printf("Connected to the WiFi network");

        // Create HTTP object
        HTTPClient http;
        http.begin("https://api.openai.com/v1/engines/davinci/completions");
        http.addHeader("Content-Type", "application/json");

        // Create JSON object
        StaticJsonDocument<200> doc;
        doc["prompt"] = "This is a test";
        doc["max_tokens"] = 5;
        doc["temperature"] = 0.9;
        doc["top_p"] = 1;
        doc["n"] = 1;
        doc["stream"] = false;
        doc["logprobs"] = NULL;
        doc["stop"] = ".";
        String output;
        serializeJson(doc, output);
        printf("JSON: %s", output.c_str());

        // Send HTTP POST request
        int httpResponseCode = http.POST(output);
        if (httpResponseCode > 0) {
            printf("HTTP Response code: %d", httpResponseCode);
            String response = http.getString();
            printf("Response: %s", response.c_str());
        }
        else {
            printf("Error on sending POST: %s", http.errorToString(httpResponseCode).c_str());
        }
        http.end();
        return 0;
    }
};