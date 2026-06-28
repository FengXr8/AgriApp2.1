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
        private String name;
        private String startDate;
        private String endDate;
        private String icon;
        private String farmingTip;
        private String description;
        private String proverb;
        private String custom;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        public String getFarmingTip() { return farmingTip; }
        public void setFarmingTip(String farmingTip) { this.farmingTip = farmingTip; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getProverb() { return proverb; }
        public void setProverb(String proverb) { this.proverb = proverb; }
        public String getCustom() { return custom; }
        public void setCustom(String custom) { this.custom = custom; }
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