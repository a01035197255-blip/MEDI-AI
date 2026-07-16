package com.project.dicom_ai.auth.oauth2.service;

import com.project.dicom_ai.auth.domain.Role;
import com.project.dicom_ai.auth.domain.User;
import com.project.dicom_ai.auth.oauth2.info.GoogleUserInfo;
import com.project.dicom_ai.auth.oauth2.info.OAuth2UserInfo;
import com.project.dicom_ai.auth.repository.UserRepository;
import com.project.dicom_ai.common.exception.BusinessException;
import com.project.dicom_ai.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {

        // 1. 구글에서 유저 정보 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();

        // 2. provider 구분 (google / naver / kakao)
        String registrationId = userRequest
                .getClientRegistration()
                .getRegistrationId();

        // 3. GoogleUserInfo로 변환
        OAuth2UserInfo userInfo;

        if (registrationId.equals("google")) {
            userInfo = new GoogleUserInfo(attributes);
        } else {
            throw new BusinessException(ErrorCode.UNSUPPORTED_OAUTH_PROVIDER);
        }

        String email = userInfo.getEmail();
        String name = userInfo.getName();
        String providerId = userInfo.getProviderId();

        // 4. DB 조회 or 회원가입
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .password("OAUTH2") // 비번 의미 없음
                            .phone(null)
                            .role(Role.DOCTOR) // 기본 역할 (원하면 USER로 변경)
                            .build();

                    return userRepository.save(newUser);
                });

        // 5. SecurityContext용 OAuth2User 리턴
        return new DefaultOAuth2User(
                Collections.singleton(() -> "ROLE_" + user.getRole().name()),
                attributes,
                "sub" // Google 기준 key
        );
    }
}