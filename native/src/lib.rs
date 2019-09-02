#[macro_use]
extern crate neon;

mod party1;
mod party2;

register_module!(mut cx, {
    cx.export_function("p1_launch_server", party1::launch_server)?;

    cx.export_function("p2_ecdsa_generate_master_key", party2::ecdsa::generate_master_key)?;
    cx.export_function("p2_ecdsa_get_child_share", party2::ecdsa::get_child_share)?;
    cx.export_function("p2_ecdsa_sign", party2::ecdsa::sign)?;

    cx.export_function("p2_schnorr_generate_key", party2::schnorr::generate_key)?;
    cx.export_function("p2_schnorr_sign", party2::schnorr::sign)?;

    cx.export_function("p2_eddsa_generate_key", party2::eddsa::generate_key)?;
    cx.export_function("p2_eddsa_sign", party2::eddsa::sign)?;

    Ok(())
});
