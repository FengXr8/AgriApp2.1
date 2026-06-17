package com.agriapp.user.dto;

/**
 * 用户统计信息 DTO
 */
public class UserStatsDTO {

    private Integer cropCount;
    private Integer recognitionCount;
    private Integer checkInDays;
    private Integer likesCount;
    private Integer todayTasks;

    // Getter and Setter
    public Integer getCropCount() {
        return cropCount;
    }

    public void setCropCount(Integer cropCount) {
        this.cropCount = cropCount;
    }

    public Integer getRecognitionCount() {
        return recognitionCount;
    }

    public void setRecognitionCount(Integer recognitionCount) {
        this.recognitionCount = recognitionCount;
    }

    public Integer getCheckInDays() {
        return checkInDays;
    }

    public void setCheckInDays(Integer checkInDays) {
        this.checkInDays = checkInDays;
    }

    public Integer getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(Integer likesCount) {
        this.likesCount = likesCount;
    }

    public Integer getTodayTasks() {
        return todayTasks;
    }

    public void setTodayTasks(Integer todayTasks) {
        this.todayTasks = todayTasks;
    }
}
