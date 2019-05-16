#[macro_use]
extern crate neon;

pub mod protocols;
pub mod server;

use protocols::two_party_ecdsa::*;
use server::p1_launch_server;

register_module!(mut cx, {
    cx.export_function("p2_get_child_share", p2_get_child_share)?;
    cx.export_function("p2_generate_master_key", p2_generate_master_key)?;
    cx.export_function("p2_sign", p2_sign)?;

    cx.export_function("p1_launch_server", p1_launch_server)?;

    Ok(())
});
