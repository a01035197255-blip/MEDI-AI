package com.project.dicom_ai.auth.oauth2.info;

import java.util.Map;

public interface OAuth2UserInfo {

    String getEmail();
    String getName();
    String getProviderId();

    Map<String, Object> getAttributes();
}
