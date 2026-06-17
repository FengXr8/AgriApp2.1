package com.agriapp.climate.dto;

import java.util.List;

/**
 * 气候信息 DTO
 * 对齐前端 domain/types/climate.types.ts 的 ClimateInfo 接口
 */
public class ClimateInfoDTO {

    private String id;

    // Location 对象，对齐前端 Location 接口
    private String province;
    private String city;
    private String district;
    private Double longitude;
    private Double latitude;
    private String address;

    private String date;
    private Integer temperature;
    private Integer humidity;
    private String wind;
    private String weatherType;
    private String airQuality;
    private String solarTerm;
    private String createdAt;

    private Integer aqi;
    private String aqiLevel;
    private Double rainfall;
    private Integer windSpeed;
    private String windDirection;
    private String updateTime;
    private List<ForecastDTO> forecast;

    // Getter and Setter

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Integer getTemperature() {
        return temperature;
    }

    public void setTemperature(Integer temperature) {
        this.temperature = temperature;
    }

    public Integer getHumidity() {
        return humidity;
    }

    public void setHumidity(Integer humidity) {
        this.humidity = humidity;
    }

    public String getWind() {
        return wind;
    }

    public void setWind(String wind) {
        this.wind = wind;
    }

    public String getWeatherType() {
        return weatherType;
    }

    public void setWeatherType(String weatherType) {
        this.weatherType = weatherType;
    }

    public String getAirQuality() {
        return airQuality;
    }

    public void setAirQuality(String airQuality) {
        this.airQuality = airQuality;
    }

    public String getSolarTerm() {
        return solarTerm;
    }

    public void setSolarTerm(String solarTerm) {
        this.solarTerm = solarTerm;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getAqi() {
        return aqi;
    }

    public void setAqi(Integer aqi) {
        this.aqi = aqi;
    }

    public String getAqiLevel() {
        return aqiLevel;
    }

    public void setAqiLevel(String aqiLevel) {
        this.aqiLevel = aqiLevel;
    }

    public Double getRainfall() {
        return rainfall;
    }

    public void setRainfall(Double rainfall) {
        this.rainfall = rainfall;
    }

    public Integer getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Integer windSpeed) {
        this.windSpeed = windSpeed;
    }

    public String getWindDirection() {
        return windDirection;
    }

    public void setWindDirection(String windDirection) {
        this.windDirection = windDirection;
    }

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }

    public List<ForecastDTO> getForecast() {
        return forecast;
    }

    public void setForecast(List<ForecastDTO> forecast) {
        this.forecast = forecast;
    }

    /**
     * 天气预报 DTO
     */
    public static class ForecastDTO {
        private String date;
        private String weatherType;
        private Integer tempMin;
        private Integer tempMax;
        private String windDirection;

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getWeatherType() {
            return weatherType;
        }

        public void setWeatherType(String weatherType) {
            this.weatherType = weatherType;
        }

        public Integer getTempMin() {
            return tempMin;
        }

        public void setTempMin(Integer tempMin) {
            this.tempMin = tempMin;
        }

        public Integer getTempMax() {
            return tempMax;
        }

        public void setTempMax(Integer tempMax) {
            this.tempMax = tempMax;
        }

        public String getWindDirection() {
            return windDirection;
        }

        public void setWindDirection(String windDirection) {
            this.windDirection = windDirection;
        }
    }
}
