var tests = ["set", "get", "remove"];

var user;

var setup = function() {
  user = User.getById(1);
  return;
}

var cleanup = function() {
  return;
}

var set = function() {
  assertThrows(function() {
    user.setMetadata(null, 1);
  });
  user.setMetadata("array", [1,2,3]);
  user.setMetadata("boolean", false);
  user.setMetadata("date", new Date("1 Feb 2345, 06:07:08"));
  user.setMetadata("float", 3.141);
  user.setMetadata("function", function add(a,b,c) {return a+b+c});
  user.setMetadata("integer", 123);
  user.setMetadata("NaN", NaN);
  user.setMetadata("null", null);
  user.setMetadata("object", {a:1,b:2,c:3});
  user.setMetadata("regexp", /^abc$/g);
  user.setMetadata("string", "123");
  user.setMetadata("undefined", undefined);
  user.setMetadata({foo: "bar", bar: "foo"});
  res.commit();
  return;
}

var get = function() {
  assertEqual(user.getMetadata("array").pop(), 3);
  assertTrue(!user.getMetadata("boolean"));
  assertEqual(user.getMetadata("date").getSeconds(), 8);
  assertEqual(user.getMetadata("float"), 3.141);
  assertEqual(user.getMetadata("function")(1,2,3), 6);
  assertEqual(user.getMetadata("integer"), 123);
  assertNaN(user.getMetadata("NaN"));
  assertEqual(user.getMetadata("null"), null);
  assertEqual(user.getMetadata("object").b, 2);
  assertMatch("abc", user.getMetadata("regexp"));
  assertEqual(user.getMetadata("string"), "123");
  assertEqual(user.getMetadata("undefined"), null);
  assertEqual(user.getMetadata("foo"), "bar");
  assertEqual(user.getMetadata("bar"), "foo");
  return;
}

var remove = function() {
  user.deleteMetadata("array");
  res.commit();
  assertNull(user.getMetadata("array"));
  user.setMetadata({"boolean": null, date: null});
  res.commit();
  assertNull(user.getMetadata("boolean"));
  assertNull(user.getMetadata("date"));
  user.deleteMetadata("float", "function");
  res.commit();
  assertNull(user.getMetadata("float"));
  assertNull(user.getMetadata("function"));
  user.deleteMetadata();
  res.commit();
  assertNull(user.getMetadata("integer"));
  assertNull(user.getMetadata("object"));
  assertNull(user.getMetadata("regexp"));
  assertNull(user.getMetadata("string"));
  assertNull(user.getMetadata("foo"));
  assertNull(user.getMetadata("bar"));
  return;
}
