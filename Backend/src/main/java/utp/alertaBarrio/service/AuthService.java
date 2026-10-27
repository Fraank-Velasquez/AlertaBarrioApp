package utp.alertaBarrio.service;

import utp.alertaBarrio.dto.auth.AuthResponse;
import utp.alertaBarrio.dto.auth.LoginRequest;
import utp.alertaBarrio.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
