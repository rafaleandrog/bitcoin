use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
pub struct WalletState {
    pub federation_id: String,
    pub community_name: String,
    pub member_count: u32,
    pub onchain_balance_sats: u64,
    pub lightning_balance_sats: u64,
    pub pending_operations: Vec<WalletOperation>,
}

#[derive(Debug, Clone, Serialize)]
pub struct WalletOperation {
    pub id: String,
    pub rail: PaymentRail,
    pub kind: OperationKind,
    pub amount_sats: u64,
    pub status: OperationStatus,
    pub description: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PaymentRail {
    Onchain,
    Lightning,
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum OperationKind {
    Receive,
    Send,
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum OperationStatus {
    Pending,
    Completed,
}

#[derive(Debug, Deserialize)]
pub struct ReceiveRequest {
    pub rail: PaymentRail,
    pub amount_sats: u64,
    pub memo: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ReceiveResponse {
    pub operation: WalletOperation,
    pub invoice_or_address: String,
}

#[derive(Debug, Deserialize)]
pub struct SendRequest {
    pub rail: PaymentRail,
    pub amount_sats: u64,
    pub destination: String,
    pub memo: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SendResponse {
    pub operation: WalletOperation,
    pub federation_proof: String,
}
