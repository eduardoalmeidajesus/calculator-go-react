package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"mime"
	"net/http"
	"strings"

	"github.com/eduardoalmeidajesus/calculator-sezzle/backend/internal/calculator"
)

const maxRequestSize = 1 << 20

type Handler struct{}

type calculateRequest struct {
	Operation string
	A         *float64
	B         *float64
}

type errorBody struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type successBody struct {
	Result float64 `json:"result"`
}

// NewHandler returns the application HTTP handler.
func NewHandler() http.Handler {
	h := &Handler{}
	return http.HandlerFunc(h.ServeHTTP)
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/api/calculate" {
		writeError(w, http.StatusNotFound, "NOT_FOUND", "The requested route was not found.")
		return
	}
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", http.MethodPost)
		writeError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Only POST is allowed for this endpoint.")
		return
	}
	if !isJSONContentType(r.Header.Get("Content-Type")) {
		writeError(w, http.StatusUnsupportedMediaType, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.")
		return
	}

	request, err := decodeRequest(w, r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.code, err.message)
		return
	}

	operation := calculator.Operation(request.Operation)
	if !calculator.IsSupported(operation) {
		writeError(w, http.StatusBadRequest, "INVALID_OPERATION", "The requested operation is not supported.")
		return
	}
	if operation == calculator.SquareRoot && request.B != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "Square root accepts only the first operand.")
		return
	}
	if operation != calculator.SquareRoot && request.B == nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", "The second operand is required for this operation.")
		return
	}

	b := 0.0
	if request.B != nil {
		b = *request.B
	}
	result, calcErr := calculator.Calculate(operation, *request.A, b)
	if calcErr != nil {
		var calculationErr *calculator.CalculationError
		if errors.As(calcErr, &calculationErr) {
			writeError(w, http.StatusBadRequest, calculationErr.Code, calculationErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred.")
		return
	}

	writeJSON(w, http.StatusOK, successBody{Result: result})
}

type requestError struct {
	code    string
	message string
}

func decodeRequest(w http.ResponseWriter, r *http.Request) (*calculateRequest, *requestError) {
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxRequestSize))
	decoder.UseNumber()

	var raw map[string]json.RawMessage
	if err := decoder.Decode(&raw); err != nil {
		return nil, &requestError{code: "INVALID_REQUEST", message: "Request body must be a valid JSON object."}
	}
	if raw == nil {
		return nil, &requestError{code: "INVALID_REQUEST", message: "Request body must be a JSON object."}
	}

	allowed := map[string]bool{"operation": true, "a": true, "b": true}
	for key := range raw {
		if !allowed[key] {
			return nil, &requestError{code: "INVALID_REQUEST", message: fmt.Sprintf("Unknown field %q.", key)}
		}
	}

	if err := ensureNoTrailingJSON(decoder); err != nil {
		return nil, &requestError{code: "INVALID_REQUEST", message: "Request body must contain exactly one JSON object."}
	}

	operationRaw, ok := raw["operation"]
	if !ok || string(operationRaw) == "null" {
		return nil, &requestError{code: "INVALID_REQUEST", message: "The operation field is required."}
	}
	var operation string
	if err := json.Unmarshal(operationRaw, &operation); err != nil || strings.TrimSpace(operation) == "" {
		return nil, &requestError{code: "INVALID_REQUEST", message: "The operation field must be a non-empty string."}
	}

	a, err := decodeNumber(raw, "a", true)
	if err != nil {
		return nil, err
	}
	b, err := decodeNumber(raw, "b", false)
	if err != nil {
		return nil, err
	}

	return &calculateRequest{Operation: operation, A: a, B: b}, nil
}

func decodeNumber(raw map[string]json.RawMessage, field string, required bool) (*float64, *requestError) {
	value, present := raw[field]
	if !present {
		if required {
			return nil, &requestError{code: "INVALID_REQUEST", message: fmt.Sprintf("The %s field is required.", field)}
		}
		return nil, nil
	}
	if string(value) == "null" {
		return nil, &requestError{code: "INVALID_REQUEST", message: fmt.Sprintf("The %s field must be a finite number.", field)}
	}
	var number float64
	if err := json.Unmarshal(value, &number); err != nil || math.IsNaN(number) || math.IsInf(number, 0) {
		return nil, &requestError{code: "INVALID_REQUEST", message: fmt.Sprintf("The %s field must be a finite number.", field)}
	}
	return &number, nil
}

func ensureNoTrailingJSON(decoder *json.Decoder) error {
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		return errors.New("trailing JSON")
	}
	return nil
}

func isJSONContentType(value string) bool {
	mediaType, _, err := mime.ParseMediaType(value)
	return err == nil && strings.EqualFold(mediaType, "application/json")
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, errorBody{Error: apiError{Code: code, Message: message}})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
