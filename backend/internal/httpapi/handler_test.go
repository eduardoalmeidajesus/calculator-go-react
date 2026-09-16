package httpapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCalculateEndpoint(t *testing.T) {
	tests := []struct {
		name        string
		method      string
		contentType string
		body        string
		wantStatus  int
		wantResult  *float64
		wantCode    string
	}{
		{name: "addition", method: http.MethodPost, contentType: "application/json", body: `{"operation":"add","a":10,"b":5}`, wantStatus: http.StatusOK, wantResult: ptr(15)},
		{name: "zero is valid", method: http.MethodPost, contentType: "application/json", body: `{"operation":"multiply","a":0,"b":5}`, wantStatus: http.StatusOK, wantResult: ptr(0)},
		{name: "sqrt without second operand", method: http.MethodPost, contentType: "application/json; charset=utf-8", body: `{"operation":"sqrt","a":9}`, wantStatus: http.StatusOK, wantResult: ptr(3)},
		{name: "division by zero", method: http.MethodPost, contentType: "application/json", body: `{"operation":"divide","a":7,"b":0}`, wantStatus: http.StatusBadRequest, wantCode: "DIVISION_BY_ZERO"},
		{name: "invalid operation", method: http.MethodPost, contentType: "application/json", body: `{"operation":"log","a":7,"b":2}`, wantStatus: http.StatusBadRequest, wantCode: "INVALID_OPERATION"},
		{name: "negative sqrt", method: http.MethodPost, contentType: "application/json", body: `{"operation":"sqrt","a":-1}`, wantStatus: http.StatusBadRequest, wantCode: "INVALID_DOMAIN"},
		{name: "missing a", method: http.MethodPost, contentType: "application/json", body: `{"operation":"add","b":2}`, wantStatus: http.StatusBadRequest, wantCode: "INVALID_REQUEST"},
		{name: "null b", method: http.MethodPost, contentType: "application/json", body: `{"operation":"add","a":1,"b":null}`, wantStatus: http.StatusBadRequest, wantCode: "INVALID_REQUEST"},
		{name: "string number", method: http.MethodPost, contentType: "application/json", body: `{"operation":"add","a":"1","b":2}`, wantStatus: http.StatusBadRequest, wantCode: "INVALID_REQUEST"},
		{name: "unknown field", method: http.MethodPost, contentType: "application/json", body: `{"operation":"add","a":1,"b":2,"extra":3}`, wantStatus: http.StatusBadRequest, wantCode: "INVALID_REQUEST"},
		{name: "malformed JSON", method: http.MethodPost, contentType: "application/json", body: `{"operation":"add"`, wantStatus: http.StatusBadRequest, wantCode: "INVALID_REQUEST"},
		{name: "multiple JSON values", method: http.MethodPost, contentType: "application/json", body: `{"operation":"add","a":1,"b":2}{}`, wantStatus: http.StatusBadRequest, wantCode: "INVALID_REQUEST"},
		{name: "wrong method", method: http.MethodGet, contentType: "application/json", body: ``, wantStatus: http.StatusMethodNotAllowed, wantCode: "METHOD_NOT_ALLOWED"},
		{name: "wrong media type", method: http.MethodPost, contentType: "text/plain", body: `{}`, wantStatus: http.StatusUnsupportedMediaType, wantCode: "UNSUPPORTED_MEDIA_TYPE"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, "/api/calculate", strings.NewReader(tt.body))
			if tt.contentType != "" {
				req.Header.Set("Content-Type", tt.contentType)
			}
			res := httptest.NewRecorder()
			NewHandler().ServeHTTP(res, req)

			if res.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d; body=%s", res.Code, tt.wantStatus, res.Body.String())
			}
			if got := res.Header().Get("Content-Type"); got != "application/json" {
				t.Fatalf("Content-Type = %q, want application/json", got)
			}

			if tt.wantResult != nil {
				var body successBody
				if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
					t.Fatalf("decode success body: %v", err)
				}
				if body.Result != *tt.wantResult {
					t.Fatalf("result = %v, want %v", body.Result, *tt.wantResult)
				}
				return
			}

			var body errorBody
			if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
				t.Fatalf("decode error body: %v", err)
			}
			if body.Error.Code != tt.wantCode {
				t.Fatalf("error code = %q, want %q", body.Error.Code, tt.wantCode)
			}
		})
	}
}

func TestCalculateEndpointNotFound(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()
	NewHandler().ServeHTTP(res, req)
	if res.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", res.Code)
	}
}

func TestCalculateEndpointRejectsSecondOperandForSqrt(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", strings.NewReader(`{"operation":"sqrt","a":9,"b":null}`))
	req.Header.Set("Content-Type", "application/json")
	res := httptest.NewRecorder()
	NewHandler().ServeHTTP(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", res.Code)
	}
}

func ptr(value float64) *float64 { return &value }
