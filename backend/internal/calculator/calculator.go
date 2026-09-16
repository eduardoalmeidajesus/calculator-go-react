package calculator

import (
	"errors"
	"math"
)

// Operation identifies an arithmetic operation supported by the service.
type Operation string

const (
	Add        Operation = "add"
	Subtract   Operation = "subtract"
	Multiply   Operation = "multiply"
	Divide     Operation = "divide"
	Power      Operation = "power"
	SquareRoot Operation = "sqrt"
	Percentage Operation = "percentage"
)

// CalculationError is a safe, client-facing calculation failure.
type CalculationError struct {
	Code    string
	Message string
}

func (e *CalculationError) Error() string { return e.Message }

var (
	ErrInvalidOperation = &CalculationError{
		Code:    "INVALID_OPERATION",
		Message: "The requested operation is not supported.",
	}
	ErrDivisionByZero = &CalculationError{
		Code:    "DIVISION_BY_ZERO",
		Message: "Division by zero is not allowed.",
	}
	ErrInvalidDomain = &CalculationError{
		Code:    "INVALID_DOMAIN",
		Message: "The operation is not defined for the supplied values.",
	}
	ErrNonFiniteResult = &CalculationError{
		Code:    "NON_FINITE_RESULT",
		Message: "The calculation produced a result outside the supported numeric range.",
	}
)

// Calculate applies an operation to a and b. SquareRoot uses only a.
func Calculate(operation Operation, a, b float64) (float64, error) {
	var result float64

	switch operation {
	case Add:
		result = a + b
	case Subtract:
		result = a - b
	case Multiply:
		result = a * b
	case Divide:
		if b == 0 {
			return 0, ErrDivisionByZero
		}
		result = a / b
	case Power:
		result = math.Pow(a, b)
	case SquareRoot:
		if a < 0 {
			return 0, ErrInvalidDomain
		}
		result = math.Sqrt(a)
	case Percentage:
		result = (a / 100) * b
	default:
		return 0, ErrInvalidOperation
	}

	if math.IsNaN(result) || math.IsInf(result, 0) {
		return 0, ErrNonFiniteResult
	}

	return result, nil
}

// IsSupported reports whether operation is part of the public contract.
func IsSupported(operation Operation) bool {
	switch operation {
	case Add, Subtract, Multiply, Divide, Power, SquareRoot, Percentage:
		return true
	default:
		return false
	}
}

// IsCalculationError allows callers to inspect a typed calculation failure.
func IsCalculationError(err error) bool {
	var calculationErr *CalculationError
	return errors.As(err, &calculationErr)
}
