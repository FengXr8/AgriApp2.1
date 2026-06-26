package com.agriapp.chat.dto;

import java.util.ArrayList;
import java.util.List;

public class AiStructuredAnswerDTO {

    private String schemaVersion = "1.0";
    private String intent = "PEST_DIAGNOSIS";
    private String answerKind = "CLARIFICATION";
    private String summary = "";
    private String evidenceSufficiency = "insufficient";
    private ImageQuality imageQuality = new ImageQuality();
    private List<String> observations = new ArrayList<>();
    private List<Candidate> candidates = new ArrayList<>();
    private List<String> followUpQuestions = new ArrayList<>();
    private List<String> actionsNow = new ArrayList<>();
    private List<String> avoidActions = new ArrayList<>();
    private List<String> monitoring = new ArrayList<>();
    private SeekExpert seekExpert = new SeekExpert();
    private String safetyNotice = "本建议用于初步排查，不能替代现场农技诊断。";

    public String getSchemaVersion() {
        return schemaVersion;
    }

    public void setSchemaVersion(String schemaVersion) {
        this.schemaVersion = schemaVersion;
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public String getAnswerKind() {
        return answerKind;
    }

    public void setAnswerKind(String answerKind) {
        this.answerKind = answerKind;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getEvidenceSufficiency() {
        return evidenceSufficiency;
    }

    public void setEvidenceSufficiency(String evidenceSufficiency) {
        this.evidenceSufficiency = evidenceSufficiency;
    }

    public ImageQuality getImageQuality() {
        return imageQuality;
    }

    public void setImageQuality(ImageQuality imageQuality) {
        this.imageQuality = imageQuality;
    }

    public List<String> getObservations() {
        return observations;
    }

    public void setObservations(List<String> observations) {
        this.observations = observations;
    }

    public List<Candidate> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<Candidate> candidates) {
        this.candidates = candidates;
    }

    public List<String> getFollowUpQuestions() {
        return followUpQuestions;
    }

    public void setFollowUpQuestions(List<String> followUpQuestions) {
        this.followUpQuestions = followUpQuestions;
    }

    public List<String> getActionsNow() {
        return actionsNow;
    }

    public void setActionsNow(List<String> actionsNow) {
        this.actionsNow = actionsNow;
    }

    public List<String> getAvoidActions() {
        return avoidActions;
    }

    public void setAvoidActions(List<String> avoidActions) {
        this.avoidActions = avoidActions;
    }

    public List<String> getMonitoring() {
        return monitoring;
    }

    public void setMonitoring(List<String> monitoring) {
        this.monitoring = monitoring;
    }

    public SeekExpert getSeekExpert() {
        return seekExpert;
    }

    public void setSeekExpert(SeekExpert seekExpert) {
        this.seekExpert = seekExpert;
    }

    public String getSafetyNotice() {
        return safetyNotice;
    }

    public void setSafetyNotice(String safetyNotice) {
        this.safetyNotice = safetyNotice;
    }

    public static class ImageQuality {
        private String level = "not_applicable";
        private List<String> issues = new ArrayList<>();
        private List<String> retakeSuggestions = new ArrayList<>();

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }

        public List<String> getIssues() {
            return issues;
        }

        public void setIssues(List<String> issues) {
            this.issues = issues;
        }

        public List<String> getRetakeSuggestions() {
            return retakeSuggestions;
        }

        public void setRetakeSuggestions(List<String> retakeSuggestions) {
            this.retakeSuggestions = retakeSuggestions;
        }
    }

    public static class Candidate {
        private String name;
        private String supportLevel;
        private List<String> supportingEvidence = new ArrayList<>();
        private List<String> contradictingEvidence = new ArrayList<>();
        private List<String> confirmNext = new ArrayList<>();

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getSupportLevel() {
            return supportLevel;
        }

        public void setSupportLevel(String supportLevel) {
            this.supportLevel = supportLevel;
        }

        public List<String> getSupportingEvidence() {
            return supportingEvidence;
        }

        public void setSupportingEvidence(List<String> supportingEvidence) {
            this.supportingEvidence = supportingEvidence;
        }

        public List<String> getContradictingEvidence() {
            return contradictingEvidence;
        }

        public void setContradictingEvidence(List<String> contradictingEvidence) {
            this.contradictingEvidence = contradictingEvidence;
        }

        public List<String> getConfirmNext() {
            return confirmNext;
        }

        public void setConfirmNext(List<String> confirmNext) {
            this.confirmNext = confirmNext;
        }
    }

    public static class SeekExpert {
        private boolean required;
        private String reason;

        public boolean isRequired() {
            return required;
        }

        public void setRequired(boolean required) {
            this.required = required;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
