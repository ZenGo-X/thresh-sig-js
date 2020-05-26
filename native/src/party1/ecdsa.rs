extern crate serde;
extern crate serde_json;
extern crate client_lib;
extern crate kms;

use neon::prelude::*;
use self::kms::ecdsa::two_party::*;
use self::client_lib::BigInt;

pub fn get_child_share(mut cx: FunctionContext) -> JsResult<JsString> {
    let expected_args = 3;
    if cx.len() != expected_args {
        return cx.throw_error("Invalid number of arguments");
    }

    let party1_master_key_share: MasterKey1 = serde_json::from_str(&cx.argument::<JsString>(0)?.value()).unwrap();
    let x: BigInt = serde_json::from_str(&cx.argument::<JsString>(1)?.value()).unwrap();
    let y: BigInt = serde_json::from_str(&cx.argument::<JsString>(2)?.value()).unwrap();

    let party1_child_share = party1_master_key_share.get_child(vec![x, y]);

    Ok(cx.string(serde_json::to_string(&party1_child_share).unwrap()))
}