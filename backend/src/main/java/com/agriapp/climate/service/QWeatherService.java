package com.agriapp.climate.service;

import com.agriapp.climate.dto.CityDTO;
import com.agriapp.climate.dto.ClimateInfoDTO;
import com.agriapp.climate.dto.FarmingSuggestionDTO;
import com.agriapp.climate.dto.WeatherAlertDTO;
import com.agriapp.farm.dto.FarmDTO;
import com.agriapp.farm.repository.FarmRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.zip.GZIPInputStream;

@Service
@Profile("local")
public class QWeatherService implements ClimateService {

    private final ObjectMapper objectMapper;
    private final FarmRepository farmRepository;
    private final HttpClient httpClient;

    @Value("${qweather.api-key}")
    private String apiKey;

    @Value("${qweather.api-host}")
    private String apiHost;

    public QWeatherService(ObjectMapper objectMapper, FarmRepository farmRepository) {
        this.objectMapper = objectMapper;
        this.farmRepository = farmRepository;
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public ClimateInfoDTO getCurrentWeather(String city) {
        try {
            String encodedCity = URLEncoder.encode(city, StandardCharsets.UTF_8);
            
            String searchUrl = String.format(
                    "https://%s/geo/v2/city/lookup?location=%s&range=cn&number=1&key=%s",
                    apiHost, encodedCity, apiKey);
            
            String searchResponse = callApi(searchUrl);
            JsonNode searchNode = objectMapper.readTree(searchResponse);
            
            if (!"200".equals(searchNode.get("code").asText()) || 
                !searchNode.has("location") || 
                searchNode.get("location").size() == 0) {
                System.err.println("未找到城市: " + city);
                return null;
            }
            
            JsonNode loc = searchNode.get("location").get(0);
            double lon = loc.get("lon").asDouble();
            double lat = loc.get("lat").asDouble();
            
            return getCurrentWeather(lon, lat);
            
        } catch (Exception e) {
            System.err.println("获取天气失败: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public ClimateInfoDTO getCurrentWeather(double longitude, double latitude) {
        ClimateInfoDTO climate = new ClimateInfoDTO();
        String location = longitude + "," + latitude;

        try {
            String locationUrl = String.format(
                    "https://%s/geo/v2/city/lookup?location=%s&key=%s",
                    apiHost, location, apiKey);
            String locationResponse = callApi(locationUrl);
            JsonNode locationNode = objectMapper.readTree(locationResponse);

            if ("200".equals(locationNode.get("code").asText()) && 
                locationNode.has("location") && 
                locationNode.get("location").size() > 0) {
                JsonNode loc = locationNode.get("location").get(0);
                climate.setProvince(getSafeText(loc, "adm1"));
                climate.setCity(getSafeText(loc, "adm2"));
                climate.setDistrict(getSafeText(loc, "name"));
                climate.setLongitude(loc.get("lon").asDouble());
                climate.setLatitude(loc.get("lat").asDouble());
                climate.setAddress(getSafeText(loc, "adm1") + getSafeText(loc, "adm2") + getSafeText(loc, "name"));
            }

            String nowUrl = String.format(
                    "https://%s/v7/weather/now?location=%s&key=%s",
                    apiHost, location, apiKey);
            String nowResponse = callApi(nowUrl);
            JsonNode nowNode = objectMapper.readTree(nowResponse);

            if ("200".equals(nowNode.get("code").asText()) && nowNode.has("now")) {
                JsonNode now = nowNode.get("now");
                climate.setTemperature(parseIntSafe(now, "temp"));
                climate.setHumidity(parseIntSafe(now, "humidity"));
                climate.setWeatherType(convertWeatherType(getSafeText(now, "text")));
                climate.setWindDirection(getSafeText(now, "windDir"));
                climate.setWindSpeed(parseIntSafe(now, "windSpeed"));
                climate.setUpdateTime(getSafeText(nowNode, "updateTime"));
                climate.setPressure(parseIntSafe(now, "pressure"));
                climate.setVisibility(parseDoubleSafe(now, "vis"));
            }

            String airUrl = String.format(
                    "https://%s/airquality/v1/current/%s/%s?key=%s",
                    apiHost, latitude, longitude, apiKey);
            String airResponse = callApi(airUrl);
            JsonNode airNode = objectMapper.readTree(airResponse);

            if (airNode.has("indexes") && !airNode.get("indexes").isEmpty()) {
                JsonNode index = airNode.get("indexes").get(0);
                climate.setAqi(parseIntSafe(index, "aqi"));
                climate.setAqiLevel(getSafeText(index, "level"));
                climate.setAirQuality(getSafeText(index, "category"));
            }

            String forecastUrl = String.format(
                    "https://%s/v7/weather/7d?location=%s&key=%s",
                    apiHost, location, apiKey);
            String forecastResponse = callApi(forecastUrl);
            JsonNode forecastNode = objectMapper.readTree(forecastResponse);

            List<ClimateInfoDTO.ForecastDTO> forecasts = new ArrayList<>();
            if ("200".equals(forecastNode.get("code").asText()) && forecastNode.has("daily")) {
                for (JsonNode daily : forecastNode.get("daily")) {
                    ClimateInfoDTO.ForecastDTO forecast = new ClimateInfoDTO.ForecastDTO();
                    String fxDate = getSafeText(daily, "fxDate");
                    if (fxDate != null && fxDate.length() >= 10) {
                        forecast.setDate(fxDate.substring(5, 10));
                    }
                    forecast.setTempMax(parseIntSafe(daily, "tempMax"));
                    forecast.setTempMin(parseIntSafe(daily, "tempMin"));
                    forecast.setWeatherType(convertWeatherType(getSafeText(daily, "textDay")));
                    forecast.setWindDirection(getSafeText(daily, "windDirDay"));
                    forecasts.add(forecast);
                }
            }
            climate.setForecast(forecasts);

            climate.setId("climate_" + UUID.randomUUID().toString().substring(0, 8));
            climate.setDate(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
            climate.setCreatedAt(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) + "T10:00:00Z");

        } catch (Exception e) {
            System.err.println("获取天气失败: " + e.getMessage());
            e.printStackTrace();
            return null;
        }

        return climate;
    }

    @Override
    public ClimateInfoDTO getWeatherByFarmId(String farmId) {
        FarmDTO farm = farmRepository.findFarmById(farmId);
        if (farm == null || farm.getLongitude() == null || farm.getLatitude() == null) {
            return null;
        }
        ClimateInfoDTO climate = getCurrentWeather(farm.getLongitude(), farm.getLatitude());
        if (climate == null) {
            return null;
        }
        climate.setAddress(farm.getAddress());
        climate.setProvince(farm.getProvince());
        climate.setCity(farm.getCity());
        climate.setDistrict(farm.getDistrict());
        return climate;
    }

    // ==================== 辅助方法 ====================

    private String callApi(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept-Encoding", "gzip, deflate")
                .build();
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        byte[] rawBody = response.body();

        if (rawBody == null) {
            return "";
        }

        if (rawBody.length > 2 && rawBody[0] == (byte)0x1f && rawBody[1] == (byte)0x8b) {
            try (GZIPInputStream gis = new GZIPInputStream(new ByteArrayInputStream(rawBody));
                 BufferedReader reader = new BufferedReader(new InputStreamReader(gis, StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                return sb.toString();
            }
        }
        return new String(rawBody, StandardCharsets.UTF_8);
    }

    private String getSafeText(JsonNode node, String field) {
        if (node == null || node.isNull() || !node.has(field)) {
            return null;
        }
        JsonNode value = node.get(field);
        return value.isNull() ? null : value.asText();
    }

    private int parseIntSafe(JsonNode node, String field) {
        if (node == null || node.isNull() || !node.has(field)) {
            return 0;
        }
        JsonNode value = node.get(field);
        if (value.isNull()) return 0;
        try {
            return value.asInt();
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private double parseDoubleSafe(JsonNode node, String field) {
        if (node == null || node.isNull() || !node.has(field)) {
            return 0.0;
        }
        JsonNode value = node.get(field);
        if (value.isNull()) return 0.0;
        try {
            return value.asDouble();
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private String convertWeatherType(String text) {
        if (text == null) return "sunny";
        text = text.toLowerCase();
        if (text.contains("晴")) return "sunny";
        if (text.contains("云") || text.contains("阴")) return "cloudy";
        if (text.contains("雨")) return "rainy";
        if (text.contains("风")) return "windy";
        if (text.contains("雾")) return "fog";
        if (text.contains("雪")) return "snow";
        return "sunny";
    }

    @Override
    public List<ClimateInfoDTO> getWeatherHistory(String location, int days) {
        return new ArrayList<>();
    }

    @Override
    public List<WeatherAlertDTO> getWeatherAlerts(double longitude, double latitude) {
        List<WeatherAlertDTO> alerts = new ArrayList<>();

        try {
            String alertUrl = String.format(
                    "https://%s/weatheralert/v1/current/%s/%s?key=%s",
                    apiHost, latitude, longitude, apiKey);
            String alertResponse = callApi(alertUrl);
            JsonNode alertNode = objectMapper.readTree(alertResponse);

            if (alertNode.has("alerts")) {
                for (JsonNode alert : alertNode.get("alerts")) {
                    WeatherAlertDTO dto = new WeatherAlertDTO();
                    dto.setId("alert_" + UUID.randomUUID().toString().substring(0, 8));
                    dto.setAlertSourceId(getSafeText(alert, "id"));
                    dto.setSenderName(getSafeText(alert, "senderName"));
                    if (alert.has("eventType") && alert.get("eventType").has("name")) {
                        dto.setEventTypeName(alert.get("eventType").get("name").asText());
                    }
                    dto.setSeverity(getSafeText(alert, "severity"));
                    dto.setHeadline(getSafeText(alert, "headline"));
                    dto.setDescription(getSafeText(alert, "description"));
                    dto.setInstruction(getSafeText(alert, "instruction"));
                    dto.setExpireTime(getSafeText(alert, "expireTime"));
                    dto.setStatus("active");
                    alerts.add(dto);
                }
            }
        } catch (Exception ignored) {}

        return alerts;
    }

    @Override
    public FarmingSuggestionDTO getFarmingAdvice(String location, String cropType) {
        FarmingSuggestionDTO suggestion = new FarmingSuggestionDTO();
        suggestion.setId("advice_" + UUID.randomUUID().toString().substring(0, 8));
        suggestion.setDate(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        suggestion.setLocation(location != null ? location : "江苏省南京市");
        suggestion.setCropType(cropType != null ? cropType : "通用");
        suggestion.setWeatherAlert("今日天气适宜农事活动");

        List<String> activities = new ArrayList<>();
        activities.add("根据当前天气情况合理安排农事活动");
        activities.add("关注天气预报，提前做好灾害防范");
        activities.add("加强田间巡查，及时防治病虫害");
        suggestion.setFarmingActivities(activities);

        List<String> warnings = new ArrayList<>();
        warnings.add("注意天气变化，及时调整农事计划");
        suggestion.setWarnings(warnings);

        suggestion.setOverallAdvice("今日天气条件良好，适合进行各类农事活动。");

        return suggestion;
    }

    @Override
    public List<CityDTO> searchCities(String query) {
        List<CityDTO> cities = new ArrayList<>();
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String searchUrl = String.format(
                    "https://%s/geo/v2/city/lookup?location=%s&range=cn&number=10&key=%s",
                    apiHost, encodedQuery, apiKey);
            
            String searchResponse = callApi(searchUrl);
            JsonNode searchNode = objectMapper.readTree(searchResponse);
            
            if (searchNode.has("code") && "200".equals(searchNode.get("code").asText()) && searchNode.has("location")) {
                for (JsonNode loc : searchNode.get("location")) {
                    CityDTO city = new CityDTO();
                    city.setId(getSafeText(loc, "id"));
                    city.setName(getSafeText(loc, "name"));
                    city.setProvince(getSafeText(loc, "adm1"));
                    city.setCity(getSafeText(loc, "adm2"));
                    city.setDistrict(getSafeText(loc, "name"));
                    city.setLongitude(parseDoubleSafe(loc, "lon"));
                    city.setLatitude(parseDoubleSafe(loc, "lat"));
                    cities.add(city);
                }
            }
        } catch (Exception e) {
            System.err.println("搜索城市失败: " + e.getMessage());
        }
        return cities;
    }

    public CityDTO getCityById(String id) {
        try {
            String lookupUrl = String.format(
                    "https://%s/geo/v2/city/lookup?location=%s&key=%s",
                    apiHost, id, apiKey);
            
            String lookupResponse = callApi(lookupUrl);
            JsonNode lookupNode = objectMapper.readTree(lookupResponse);
            
            if (lookupNode.has("code") && "200".equals(lookupNode.get("code").asText()) && lookupNode.has("location")) {
                JsonNode loc = lookupNode.get("location").get(0);
                CityDTO city = new CityDTO();
                city.setId(getSafeText(loc, "id"));
                city.setName(getSafeText(loc, "name"));
                city.setProvince(getSafeText(loc, "adm1"));
                city.setCity(getSafeText(loc, "adm2"));
                city.setDistrict(getSafeText(loc, "name"));
                city.setLongitude(parseDoubleSafe(loc, "lon"));
                city.setLatitude(parseDoubleSafe(loc, "lat"));
                return city;
            }
        } catch (Exception e) {
            System.err.println("获取城市信息失败: " + e.getMessage());
        }
        return null;
    }
}