package com.agriapp.climate.dto;

/**
 * 节气信息 DTO
 * 对齐前端 domain/types/climate.types.ts 的 SolarTermInfo 接口
 */
public class SolarTermInfoDTO {

    private CurrentTermDTO currentTerm;
    private NextTermDTO nextTerm;

    public CurrentTermDTO getCurrentTerm() {
        return currentTerm;
    }

    public void setCurrentTerm(CurrentTermDTO currentTerm) {
        this.currentTerm = currentTerm;
    }

    public NextTermDTO getNextTerm() {
        return nextTerm;
    }

    public void setNextTerm(NextTermDTO nextTerm) {
        this.nextTerm = nextTerm;
    }

    /**
     * 当前节气 DTO
     */
    public static class CurrentTermDTO {
        private String name;           // 节气名称
        private String startDate;      // 开始日期
        private String endDate;        // 结束日期
        private String icon;           // 节气图标
        private String farmingTip;     // 农事提示

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getStartDate() {
            return startDate;
        }

        public void setStartDate(String startDate) {
            this.startDate = startDate;
        }

        public String getEndDate() {
            return endDate;
        }

        public void setEndDate(String endDate) {
            this.endDate = endDate;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }

        public String getFarmingTip() {
            return farmingTip;
        }

        public void setFarmingTip(String farmingTip) {
            this.farmingTip = farmingTip;
        }
    }

    /**
     * 下一节气 DTO
     */
    public static class NextTermDTO {
        private String name;           // 下一节气名称
        private Integer daysUntil;     // 距离天数

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getDaysUntil() {
            return daysUntil;
        }

        public void setDaysUntil(Integer daysUntil) {
            this.daysUntil = daysUntil;
        }
    }
}