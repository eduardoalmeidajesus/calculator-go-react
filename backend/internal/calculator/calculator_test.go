package calculator

import (
	"math"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name      string
		operation Operation
		a, b      float64
		want      float64
	}{
		{name: "addition", operation: Add, a: 2, b: 3, want: 5},
		{name: "subtraction", operation: Subtract, a: 2, b: 3, want: -1},
		{name: "multiplication", operation: Multiply, a: -2, b: 3, want: -6},
		{name: "division", operation: Divide, a: 7, b: 2, want: 3.5},
		{name: "power", operation: Power, a: 2, b: 3, want: 8},
		{name: "square root", operation: SquareRoot, a: 9, want: 3},
		{name: "percentage", operation: Percentage, a: 15, b: 200, want: 30},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calculate(tt.operation, tt.a, tt.b)
			if err != nil {
				t.Fatalf("Calculate() returned unexpected error: %v", err)
			}
			if math.Abs(got-tt.want) > 1e-12 {
				t.Fatalf("Calculate() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestCalculateErrors(t *testing.T) {
	tests := []struct {
		name      string
		operation Operation
		a, b      float64
		wantCode  string
	}{
		{name: "division by zero", operation: Divide, a: 1, b: 0, wantCode: "DIVISION_BY_ZERO"},
		{name: "negative square root", operation: SquareRoot, a: -1, wantCode: "INVALID_DOMAIN"},
		{name: "unknown operation", operation: "log", a: 1, b: 2, wantCode: "INVALID_OPERATION"},
		{name: "overflow", operation: Multiply, a: math.MaxFloat64, b: 2, wantCode: "NON_FINITE_RESULT"},
		{name: "power domain", operation: Power, a: -1, b: 0.5, wantCode: "NON_FINITE_RESULT"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := Calculate(tt.operation, tt.a, tt.b)
			if err == nil {
				t.Fatal("Calculate() expected an error")
			}
			calculationErr, ok := err.(*CalculationError)
			if !ok || calculationErr.Code != tt.wantCode {
				t.Fatalf("Calculate() error = %v, want code %s", err, tt.wantCode)
			}
		})
	}
}

func TestIsSupported(t *testing.T) {
	for _, operation := range []Operation{Add, Subtract, Multiply, Divide, Power, SquareRoot, Percentage} {
		if !IsSupported(operation) {
			t.Errorf("IsSupported(%q) = false, want true", operation)
		}
	}
	if IsSupported("unknown") {
		t.Error("IsSupported(unknown) = true, want false")
	}
}
