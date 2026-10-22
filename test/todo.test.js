import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, toggleTodo, removeTodo, visibleTodos, clearCompleted } from "../src/todo.js";

test("addTodo appends a trimmed title with the next id", () => {
  const one = addTodo([], "  Buy milk ");
  assert.deepEqual(one, [{ id: 1, title: "Buy milk", done: false }]);
  assert.equal(addTodo(one, "Walk dog")[1].id, 2);
});

test("addTodo ignores an empty title", () => {
  assert.deepEqual(addTodo([], "   "), []);
});

test("toggleTodo flips only the matching todo", () => {
  const todos = addTodo(addTodo([], "a"), "b");
  const toggled = toggleTodo(todos, 2);
  assert.equal(toggled[0].done, false);
  assert.equal(toggled[1].done, true);
});

test("removeTodo drops the matching todo", () => {
  const todos = addTodo(addTodo([], "a"), "b");
  assert.deepEqual(removeTodo(todos, 1).map((t) => t.title), ["b"]);
});

test("visibleTodos filters by active and done", () => {
  const todos = toggleTodo(addTodo(addTodo([], "a"), "b"), 1);
  assert.deepEqual(visibleTodos(todos, "active").map((t) => t.title), ["b"]);
  assert.deepEqual(visibleTodos(todos, "done").map((t) => t.title), ["a"]);
  assert.equal(visibleTodos(todos, "all").length, 2);
});

test("clearCompleted keeps unfinished todos in their original order and state", () => {
  const todos = toggleTodo(
    toggleTodo(addTodo(addTodo(addTodo([], "a"), "b"), "c"), 1),
    3,
  );
  const active = todos.filter((t) => !t.done);
  const cleared = clearCompleted(todos);
  assert.deepEqual(cleared, active);
  assert.deepEqual(cleared.map((t) => t.title), active.map((t) => t.title));
  assert.deepEqual(cleared.map((t) => t.id), active.map((t) => t.id));
  assert.ok(cleared.every((t) => t.done === false));
});

test("clearCompleted leaves the list unchanged when nothing is completed", () => {
  const todos = addTodo(addTodo([], "a"), "b");
  assert.deepEqual(clearCompleted(todos), todos);
  assert.deepEqual(clearCompleted([]), []);
});

test("clearCompleted does not mutate its input", () => {
  const todos = toggleTodo(addTodo(addTodo([], "a"), "b"), 1);
  const snapshot = structuredClone(todos);
  clearCompleted(todos);
  assert.deepEqual(todos, snapshot);
});

test("clearCompleted results keep the active, done and all filters consistent", () => {
  const todos = toggleTodo(
    toggleTodo(addTodo(addTodo(addTodo([], "a"), "b"), "c"), 1),
    3,
  );
  const cleared = clearCompleted(todos);
  assert.deepEqual(visibleTodos(cleared, "all").map((t) => t.title), ["b"]);
  assert.deepEqual(visibleTodos(cleared, "active").map((t) => t.title), ["b"]);
  assert.deepEqual(visibleTodos(cleared, "done"), []);
});
