package com.agriapp.test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * 和风天气 API 测试类
 * 
 * 功能：
 * 1. 测试城市查询 API（通过经纬度获取 LocationID）
 * 2. 测试实时天气 API
 * 3. 测试3天天气预报 API
 * 4. 测试空气质量 API
 * 5. 测试天气预警 API
 * 
 * 使用说明：
 * 1. 运行 main 方法
 * 2. 查看控制台输出的 JSON 数据
 * 3. 分析数据结构，为后续数据库设计做准备
 */
public class QWeatherApiTest {

    // ==================== API 配置 ====================
    // API Host
    private static final String API_HOST = "https://n23aapbhhp.re.qweatherapi.com";
    
    // API Key
    private static final String API_KEY = "669fc3a96ff74c9999059fe7df4125cb";
    
    // 测试地点：南京-江宁 的经纬度
    private static final String TEST_LONGITUDE = "118.9074";
    private static final String TEST_LATITUDE = "31.9544";
    
    // ==================== API 端点 ====================
    // 城市查询 API：通过经纬度获取城市信息
    private static final String GEO_LOOKUP_URL = API_HOST + "/geo/v2/city/lookup?location=%s,%s&key=" + API_KEY;
    
    // 实时天气 API
    private static final String WEATHER_NOW_URL = API_HOST + "/v7/weather/now?location=%s&key=" + API_KEY;
    
    // 3天天气预报 API
    private static final String WEATHER_3D_URL = API_HOST + "/v7/weather/3d?location=%s&key=" + API_KEY;
    
    // 空气质量 API
    private static final String AIR_QUALITY_URL = API_HOST + "/airquality/v1/current/%s/%s?key=" + API_KEY;
    
    // 天气预警 API
    private static final String WEATHER_ALERT_URL = API_HOST + "/weatheralert/v1/current/%s/%s?key=" + API_KEY;

    public static void main(String[] args) {
        System.out.println("=".repeat(60));
        System.out.println("和风天气 API 测试开始");
        System.out.println("测试地点：南京-江宁 (经度:" + TEST_LONGITUDE + ", 纬度:" + TEST_LATITUDE + ")");
        System.out.println("=".repeat(60));
        
        try {
            // 第一步：通过经纬度获取城市信息（包含 LocationID）
            testGeoLookup();
            
            // 第二步：测试实时天气 API
            testWeatherNow();
            
            // 第三步：测试3天天气预报 API
            testWeather3Day();
            
            // 第四步：测试空气质量 API
            testAirQuality();
            
            // 第五步：测试天气预警 API
            testWeatherAlert();
            
        } catch (Exception e) {
            System.err.println("测试过程中发生错误：" + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("\n" + "=".repeat(60));
        System.out.println("和风天气 API 测试完成");
        System.out.println("=".repeat(60));
    }

    /**
     * 测试城市查询 API
     * 通过经纬度获取城市信息，包括 LocationID
     */
    private static void testGeoLookup() {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("【1】城市查询 API 测试");
        System.out.println("-".repeat(60));
        
        String url = String.format(GEO_LOOKUP_URL, TEST_LONGITUDE, TEST_LATITUDE);
        System.out.println("请求地址：" + url);
        
        try {
            String response = sendGetRequest(url);
            System.out.println("\n返回数据：");
            System.out.println(response);
            
            // 解析提示
            System.out.println("\n解析提示：");
            System.out.println("- 关注字段：code（状态码）、location（位置信息）");
            System.out.println("- location.id 就是 LocationID，用于后续天气查询");
            
        } catch (Exception e) {
            System.err.println("请求失败：" + e.getMessage());
        }
    }

    /**
     * 测试实时天气 API
     */
    private static void testWeatherNow() {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("【2】实时天气 API 测试");
        System.out.println("-".repeat(60));
        
        // 使用经纬度直接查询
        String location = TEST_LONGITUDE + "," + TEST_LATITUDE;
        String url = String.format(WEATHER_NOW_URL, location);
        System.out.println("请求地址：" + url);
        
        try {
            String response = sendGetRequest(url);
            System.out.println("\n返回数据：");
            System.out.println(response);
            
            // 解析提示
            System.out.println("\n解析提示 - now 对象字段说明：");
            System.out.println("- obsTime: 数据观测时间");
            System.out.println("- temp: 温度（摄氏度）");
            System.out.println("- feelsLike: 体感温度");
            System.out.println("- text: 天气状况文字（多云、晴、雨等）");
            System.out.println("- icon: 天气图标代码");
            System.out.println("- windDir: 风向");
            System.out.println("- windScale: 风力等级");
            System.out.println("- windSpeed: 风速（公里/小时）");
            System.out.println("- humidity: 相对湿度（百分比）");
            System.out.println("- precip: 过去1小时降水量（毫米）");
            System.out.println("- pressure: 大气压强（百帕）");
            System.out.println("- vis: 能见度（公里）");
            System.out.println("- cloud: 云量（百分比）");
            System.out.println("- dew: 露点温度");
            
        } catch (Exception e) {
            System.err.println("请求失败：" + e.getMessage());
        }
    }

    /**
     * 测试3天天气预报 API
     */
    private static void testWeather3Day() {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("【3】3天天气预报 API 测试");
        System.out.println("-".repeat(60));
        
        // 使用经纬度直接查询
        String location = TEST_LONGITUDE + "," + TEST_LATITUDE;
        String url = String.format(WEATHER_3D_URL, location);
        System.out.println("请求地址：" + url);
        
        try {
            String response = sendGetRequest(url);
            System.out.println("\n返回数据：");
            System.out.println(response);
            
            // 解析提示
            System.out.println("\n解析提示 - daily 数组字段说明：");
            System.out.println("- fxDate: 预报日期");
            System.out.println("- sunrise/sunset: 日出/日落时间");
            System.out.println("- moonrise/moonset: 月升/月落时间");
            System.out.println("- moonPhase: 月相名称");
            System.out.println("- tempMax/tempMin: 最高/最低温度");
            System.out.println("- textDay/textNight: 白天/夜间天气状况文字");
            System.out.println("- iconDay/iconNight: 白天/夜间天气图标代码");
            System.out.println("- windDirDay/windDirNight: 白天/夜间风向");
            System.out.println("- windScaleDay/windScaleNight: 白天/夜间风力等级");
            System.out.println("- humidity: 相对湿度");
            System.out.println("- precip: 预报当天总降水量");
            System.out.println("- uvIndex: 紫外线强度指数");
            
        } catch (Exception e) {
            System.err.println("请求失败：" + e.getMessage());
        }
    }

    /**
     * 测试空气质量 API
     */
    private static void testAirQuality() {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("【4】空气质量 API 测试");
        System.out.println("-".repeat(60));
        
        // 使用经纬度直接查询（注意顺序：纬度,经度）
        String url = String.format(AIR_QUALITY_URL, TEST_LATITUDE, TEST_LONGITUDE);
        System.out.println("请求地址：" + url);
        
        try {
            String response = sendGetRequest(url);
            System.out.println("\n返回数据：");
            System.out.println(response);
            
            // 解析提示
            System.out.println("\n解析提示 - indexes 数组字段说明：");
            System.out.println("- code: 指数代码（如 us-epa、qaqi）");
            System.out.println("- name: 指数名称");
            System.out.println("- aqi: 空气质量指数值");
            System.out.println("- aqiDisplay: 空气质量指数显示文本");
            System.out.println("- level: 空气质量等级");
            System.out.println("- category: 空气质量类别（如 优、良）");
            System.out.println("- primaryPollutant: 首要污染物");
            System.out.println("- health: 健康建议");
            
            System.out.println("\n解析提示 - pollutants 数组字段说明：");
            System.out.println("- name: 污染物名称（PM2.5、PM10、O3、NO2、SO2、CO）");
            System.out.println("- concentration: 污染物浓度");
            System.out.println("- aqi: 该污染物的空气质量指数");
            
        } catch (Exception e) {
            System.err.println("请求失败：" + e.getMessage());
        }
    }

    /**
     * 测试天气预警 API
     */
    private static void testWeatherAlert() {
        System.out.println("\n" + "-".repeat(60));
        System.out.println("【5】天气预警 API 测试");
        System.out.println("-".repeat(60));
        
        // 使用经纬度直接查询（注意顺序：纬度,经度）
        String url = String.format(WEATHER_ALERT_URL, TEST_LATITUDE, TEST_LONGITUDE);
        System.out.println("请求地址：" + url);
        
        try {
            String response = sendGetRequest(url);
            System.out.println("\n返回数据：");
            System.out.println(response);
            
            // 解析提示
            System.out.println("\n解析提示 - alerts 数组字段说明：");
            System.out.println("- id: 预警信息唯一标识");
            System.out.println("- senderName: 预警发布机构名称");
            System.out.println("- eventType: 预警事件类型（如 大风、暴雨、霜冻）");
            System.out.println("- severity: 预警严重程度（minor/moderate/severe/extreme）");
            System.out.println("- headline: 预警简要描述");
            System.out.println("- description: 预警详细描述");
            System.out.println("- instruction: 防御指南");
            System.out.println("- effectiveTime: 生效时间");
            System.out.println("- expireTime: 失效时间");
            
        } catch (Exception e) {
            System.err.println("请求失败：" + e.getMessage());
        }
    }

    /**
     * 发送 GET 请求
     */
    private static String sendGetRequest(String url) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/json")
                .GET()
                .build();
        
        HttpResponse<java.io.InputStream> response = client.send(request, 
                HttpResponse.BodyHandlers.ofInputStream());
        
        // 处理 Gzip 解压缩
        java.io.InputStream inputStream = response.body();
        java.util.zip.GZIPInputStream gzipStream = new java.util.zip.GZIPInputStream(inputStream);
        java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(gzipStream, java.nio.charset.StandardCharsets.UTF_8));
        
        StringBuilder result = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            result.append(line);
        }
        reader.close();
        
        return result.toString();
    }
}
