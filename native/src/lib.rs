#[macro_use]
extern crate neon;

pub mod protocols;

use protocols::two_party_ecdsa;

register_module!(mut cx, {
    cx.export_function("ecdsa_p2_get_child_share", two_party_ecdsa::party2::get_child_share)?;
    cx.export_function("ecdsa_p2_generate_master_key", two_party_ecdsa::party2::generate_master_key)?;
    cx.export_function("ecdsa_p2_sign", two_party_ecdsa::party2::sign)?;
    cx.export_function("ecdsa_p1_launch_server", two_party_ecdsa::party1::launch_server)?;

    Ok(())
});
