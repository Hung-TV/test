package com.jela.api.enums;

public enum ReviewQuality {
    AGAIN(1),
    HARD(2),
    GOOD(3);

    private final int value;

    ReviewQuality(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static ReviewQuality fromValue(int value) {
        for (ReviewQuality q : values()) {
            if (q.value == value) return q;
        }
        throw new IllegalArgumentException("Unknown review quality value: " + value);
    }
}
