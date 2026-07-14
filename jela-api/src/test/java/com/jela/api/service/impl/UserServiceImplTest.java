package com.jela.api.service.impl;

import com.jela.api.entity.User;
import com.jela.api.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    public void testUpdateStreak_whenLastStudiedAtIsNull() {
        User user = User.builder()
                .userId(1L)
                .streakCount(0)
                .lastStudiedAt(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updateStreak(1L);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();

        assertThat(savedUser.getStreakCount()).isEqualTo(1);
        assertThat(savedUser.getLastStudiedAt()).isNotNull();
    }

    @Test
    public void testUpdateStreak_whenLastStudiedAtIsToday() {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        Instant now = Instant.now();
        
        User user = User.builder()
                .userId(1L)
                .streakCount(5)
                .lastStudiedAt(now)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updateStreak(1L);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();

        assertThat(savedUser.getStreakCount()).isEqualTo(5);
        assertThat(savedUser.getLastStudiedAt()).isNotNull();
    }

    @Test
    public void testUpdateStreak_whenLastStudiedAtIsYesterday() {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime today = ZonedDateTime.now(zoneId);
        ZonedDateTime yesterday = today.minusDays(1);
        Instant lastStudied = yesterday.toInstant();

        User user = User.builder()
                .userId(1L)
                .streakCount(3)
                .lastStudiedAt(lastStudied)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updateStreak(1L);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();

        assertThat(savedUser.getStreakCount()).isEqualTo(4);
        assertThat(savedUser.getLastStudiedAt()).isNotNull();
    }

    @Test
    public void testUpdateStreak_whenLastStudiedAtIsTwoDaysAgo() {
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime today = ZonedDateTime.now(zoneId);
        ZonedDateTime twoDaysAgo = today.minusDays(2);
        Instant lastStudied = twoDaysAgo.toInstant();

        User user = User.builder()
                .userId(1L)
                .streakCount(8)
                .lastStudiedAt(lastStudied)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updateStreak(1L);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();

        assertThat(savedUser.getStreakCount()).isEqualTo(1);
        assertThat(savedUser.getLastStudiedAt()).isNotNull();
    }
}
