package com.incident.system.service;

import com.incident.system.dto.ChangePasswordRequest;
import com.incident.system.dto.PagedResponse;
import com.incident.system.dto.RegisterRequest;
import com.incident.system.dto.UserSummaryDto;
import com.incident.system.entity.Role;
import com.incident.system.entity.RoleName;
import com.incident.system.entity.User;
import com.incident.system.exception.ConflictException;
import com.incident.system.exception.ResourceNotFoundException;
import com.incident.system.repository.RoleRepository;
import com.incident.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return UserSummaryDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserSummaryDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserSummaryDto> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return PagedResponse.of(users.map(UserSummaryDto::fromEntity));
    }

    @Transactional
    public UserSummaryDto createUserByAdmin(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username '" + request.getUsername() + "' is already in use");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email '" + request.getEmail() + "' is already registered");
        }

        RoleName resolvedRole = RoleName.ROLE_EMPLOYEE;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                String roleStr = request.getRole().toUpperCase();
                if (!roleStr.startsWith("ROLE_")) {
                    roleStr = "ROLE_" + roleStr;
                }
                resolvedRole = RoleName.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role specified: " + request.getRole() + 
                        ". Supported roles: ROLE_EMPLOYEE, ROLE_TECHNICIAN, ROLE_ADMIN");
            }
        }

        final RoleName finalRole = resolvedRole;
        Role role = roleRepository.findByName(finalRole)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + finalRole));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .department(request.getDepartment())
                .role(role)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        return UserSummaryDto.fromEntity(savedUser);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
