use std::sync::{Arc, Mutex};

use thiserror::Error;
use uuid::Uuid;

use crate::models::{
    OperationKind, OperationStatus, PaymentRail, ReceiveRequest, ReceiveResponse, SendRequest,
    SendResponse, WalletOperation, WalletState,
};

#[derive(Clone)]
pub struct FederationWalletService {
    state: Arc<Mutex<WalletState>>,
}

#[derive(Debug, Error)]
pub enum WalletError {
    #[error("saldo insuficiente para esta operação")]
    InsufficientBalance,
    #[error("valor inválido: precisa ser maior que zero")]
    InvalidAmount,
}

impl FederationWalletService {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(WalletState {
                federation_id: "fed-community-br-001".to_string(),
                community_name: "Carteira Comunitária Bitcoin BR".to_string(),
                member_count: 42,
                onchain_balance_sats: 250_000,
                lightning_balance_sats: 125_000,
                pending_operations: Vec::new(),
            })),
        }
    }

    pub fn get_state(&self) -> WalletState {
        self.state.lock().expect("state lock").clone()
    }

    pub fn receive_payment(&self, req: ReceiveRequest) -> Result<ReceiveResponse, WalletError> {
        if req.amount_sats == 0 {
            return Err(WalletError::InvalidAmount);
        }

        let memo = req
            .memo
            .unwrap_or_else(|| "Recebimento comunitário".to_string());

        let operation = WalletOperation {
            id: Uuid::new_v4().to_string(),
            rail: req.rail,
            kind: OperationKind::Receive,
            amount_sats: req.amount_sats,
            status: OperationStatus::Completed,
            description: memo,
        };

        let mut state = self.state.lock().expect("state lock");
        match req.rail {
            PaymentRail::Onchain => state.onchain_balance_sats += req.amount_sats,
            PaymentRail::Lightning => state.lightning_balance_sats += req.amount_sats,
        }
        state.pending_operations.insert(0, operation.clone());
        if state.pending_operations.len() > 15 {
            state.pending_operations.pop();
        }

        Ok(ReceiveResponse {
            invoice_or_address: match req.rail {
                PaymentRail::Onchain => format!(
                    "bc1qcommunity{}",
                    Uuid::new_v4().simple().to_string()[..16].to_string()
                ),
                PaymentRail::Lightning => format!(
                    "lnbc{}n1p{}",
                    req.amount_sats,
                    Uuid::new_v4().simple().to_string()[..20].to_string()
                ),
            },
            operation,
        })
    }

    pub fn send_payment(&self, req: SendRequest) -> Result<SendResponse, WalletError> {
        if req.amount_sats == 0 {
            return Err(WalletError::InvalidAmount);
        }

        let mut state = self.state.lock().expect("state lock");
        match req.rail {
            PaymentRail::Onchain if state.onchain_balance_sats < req.amount_sats => {
                return Err(WalletError::InsufficientBalance)
            }
            PaymentRail::Lightning if state.lightning_balance_sats < req.amount_sats => {
                return Err(WalletError::InsufficientBalance)
            }
            PaymentRail::Onchain => state.onchain_balance_sats -= req.amount_sats,
            PaymentRail::Lightning => state.lightning_balance_sats -= req.amount_sats,
        }

        let memo = req.memo.unwrap_or_else(|| {
            format!(
                "Envio via {:?} para {}",
                req.rail,
                req.destination.chars().take(14).collect::<String>()
            )
        });

        let operation = WalletOperation {
            id: Uuid::new_v4().to_string(),
            rail: req.rail,
            kind: OperationKind::Send,
            amount_sats: req.amount_sats,
            status: OperationStatus::Completed,
            description: memo,
        };

        state.pending_operations.insert(0, operation.clone());
        if state.pending_operations.len() > 15 {
            state.pending_operations.pop();
        }

        Ok(SendResponse {
            operation,
            federation_proof: format!(
                "fed-proof-{}",
                Uuid::new_v4().simple().to_string()[..18].to_string()
            ),
        })
    }
}
