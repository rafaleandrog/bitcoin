mod federation;
mod models;

use std::net::SocketAddr;

use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use federation::{FederationWalletService, WalletError};
use models::{ReceiveRequest, SendRequest, WalletState};
use serde_json::json;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    let service = FederationWalletService::new();

    let app = Router::new()
        .route("/api/wallet/state", get(get_wallet_state))
        .route("/api/wallet/receive", post(receive_payment))
        .route("/api/wallet/send", post(send_payment))
        .with_state(service)
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    println!("Fedimint wallet backend running at http://{addr}");
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind");
    axum::serve(listener, app).await.expect("server");
}

async fn get_wallet_state(State(service): State<FederationWalletService>) -> Json<WalletState> {
    Json(service.get_state())
}

async fn receive_payment(
    State(service): State<FederationWalletService>,
    Json(req): Json<ReceiveRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let response = service.receive_payment(req)?;
    Ok(Json(json!(response)))
}

async fn send_payment(
    State(service): State<FederationWalletService>,
    Json(req): Json<SendRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let response = service.send_payment(req)?;
    Ok(Json(json!(response)))
}

struct ApiError(WalletError);

impl From<WalletError> for ApiError {
    fn from(value: WalletError) -> Self {
        Self(value)
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        let status = match self.0 {
            WalletError::InsufficientBalance => StatusCode::BAD_REQUEST,
            WalletError::InvalidAmount => StatusCode::UNPROCESSABLE_ENTITY,
        };

        (status, Json(json!({ "error": self.0.to_string() }))).into_response()
    }
}
