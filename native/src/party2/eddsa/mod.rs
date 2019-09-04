extern crate serde;
extern crate serde_json;
extern crate client_lib;

use neon::prelude::*;
use self::client_lib::*;
use self::client_lib::{BigInt, ClientShim};

struct KeyGenTask {
    p1_endpoint: String,
}

struct SignTask {
    p1_endpoint: String,
    msg_hash: BigInt,
    key_pair: KeyPair,
    agg_pub_key: KeyAgg,
    id: String,
}

pub fn generate_key(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let expected_args = 2;
    if cx.len() != expected_args {
        return cx.throw_error("Invalid number of arguments");
    }

    let p1_endpoint: String = cx.argument::<JsString>(0)?.value();
    let cb = cx.argument::<JsFunction>(1)?;

    let task = KeyGenTask { p1_endpoint };
    task.schedule(cb);

    Ok(cx.undefined())
}

pub fn sign(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let expected_args = 6;
    if cx.len() != expected_args {
        return cx.throw_error("Invalid number of arguments");
    }

    let p1_endpoint: String = cx.argument::<JsString>(0)?.value();
    let msg_hash: BigInt = serde_json::from_str(&cx.argument::<JsString>(1)?.value()).unwrap();
    let mut key_pair: KeyPair = serde_json::from_str(&cx.argument::<JsString>(2)?.value()).unwrap();
    let mut agg_pub_key: KeyAgg = serde_json::from_str(&cx.argument::<JsString>(3)?.value()).unwrap();
    let id: String = cx.argument::<JsString>(4)?.value();
    let cb = cx.argument::<JsFunction>(5)?;

    let eight: FE = ECScalar::from(&BigInt::from(8));
    let eight_inverse: FE = eight.invert();
    key_pair.public_key = key_pair.public_key * &eight_inverse;
    agg_pub_key.apk = agg_pub_key.apk * &eight_inverse;

    let task = SignTask { p1_endpoint, msg_hash, key_pair, agg_pub_key, id };
    task.schedule(cb);

    Ok(cx.undefined())
}

impl Task for KeyGenTask {
    type Output = String;
    type Error = String;
    type JsEvent = JsString;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let client_shim = ClientShim::new(self.p1_endpoint.to_string(), None);
        let share = client_lib::eddsa::generate_key(&client_shim)
            .expect("EdDSA KeyGen failed");
        Ok(serde_json::to_string(&share).unwrap())
    }

    fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
        Ok(cx.string(result.unwrap()))
    }
}

impl Task for SignTask {
    type Output = String;
    type Error = String;
    type JsEvent = JsString;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let client_shim = ClientShim::new(self.p1_endpoint.to_string(), None);
        let signature = client_lib::eddsa::sign(
            &client_shim,
            self.msg_hash.clone(),
            &self.key_pair,
            &self.agg_pub_key,
            &self.id)
            .expect("EdDSA signature failed");
        Ok(serde_json::to_string(&signature).unwrap())
    }

    fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
        Ok(cx.string(result.unwrap()))
    }
}
