# SMPBR-web-api-messages

TypeScript messaging layer for the SMPBR (Smart Mini Photobioreactor) web API. Provides strongly-typed, runtime-validated wrappers around `fetch()` for all hardware domains, targeting two backends: `reactorApi` (port 8089) and `webControlApi` (port 80).

## Endpoints

### Control
| Method | Endpoint | Description |
|---|---|---|
| GET | `/control/mixer/info` | Mixer RPM limits (`maxRPM`, `minRPM`) |

### Sensor
| Method | Endpoint | Description |
|---|---|---|
| POST | `/sensor/fluorometer/ojip/capture` | Triggers OJIP capture; timeout scales with `lengthMs`; rejects while one is in progress |
| GET | `/sensor/fluorometer/ojip/completed` | Whether the OJIP capture has finished |
| GET | `/sensor/fluorometer/ojip/read_last` | Returns the last OJIP measurement; rejects while a capture is running |
| POST | `/sensor/fluorometer/calibrate` | Calibrates the fluorometer; rejects while a capture is in progress |
| GET | `/control/heater/target_temperature` | Heater target (`targetTemp` or `undefined`); **accepts 404** to model "no target set" |
| POST | `/sensor/spectrophotometer/measure_all` | Per-channel samples (`channel`, `relative_value`, `absolute_value`) |

### Pumps
URLs include an instance index resolved via the module list; `pumpIndex` is optional.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/pumps/{instance}/{pump?}/info` | Pump flowrate limits |
| GET | `/pumps/{instance}/{pump}/stop` | Stops the pump (note: GET — unusual for a stop action) |

### Recipes
| Method | Endpoint | Description |
|---|---|---|
| GET / PATCH | `/recipes` | List recipes; PATCH forces a filesystem reload |
| GET | `/recipes/{fileName}` | Read recipe content |
| PUT | `/recipes/{fileName}` | Write recipe content |
| DELETE | `/recipes/{fileName}` | Delete recipe file |

### Scheduler
| Method | Endpoint | Description |
|---|---|---|
| GET | `/scheduler/recipe` | Currently scheduled recipe |
| POST | `/scheduler/recipe/{fileName}` | Set the scheduled recipe |
| POST | `/scheduler/start` | Start execution; returns `processId` |
| POST | `/scheduler/stop` | Stop execution |
| GET | `/scheduler/runtime` | Runtime info including derived `state` (`Running`/`Paused`/`Stopped`/`NeverStarted`) |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | `/system/modules` | Connected modules, sorted by uid desc |
| GET | `/system/errors` | Active errors |
| GET | `/system/warnings` | Active warnings |
| GET | `/system/module/issues` | Module issues (sensor readings etc.) |
| GET | `/system/version` | Firmware version, git hash, dirty flag |
| POST | `/core/hostname` | Change device hostname (triggers a reboot) |

### Services
| Method | Endpoint | Description |
|---|---|---|
| GET | `/services` | systemd-style service status with derived `stateType` |
| POST | `/services/swupdate/update` | Upload `.swu` firmware (60 s timeout; accepts 200/202; triggers reboot) |

### Temperature Logs *(webControlApi)*
| Method | Endpoint | Description |
|---|---|---|
| POST | `/temperature-logs` | Body `{fromCycle, scope: "M"\|"H"\|"D"}`; returns logs plus `logCount`, `historyLen`, `toCycle` |

### Time *(webControlApi)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/time` | Round-trip-compensated device time; publishes global signals |
| POST | `/time/convert` | Convert a timestamp between local and server clocks |

## Notes

- HTTP conventions: GET for reads, POST for actions, PUT/DELETE for file writes/deletes. Default timeout is 10 s.
- Responses are JSON-parsed and validated against expected shapes; mismatches raise `ApiUnparsableBody`.
- Errors include connection, invalid status, and unparsable-body variants, all carrying the URL and method for diagnostics.
- Hostname and SWU update endpoints trigger a device reboot on success — callers must handle the restart.
- Each domain exports a `<Category>_<Module>` namespace with `sendXxx` functions and `XxxOptions` / `XxxResult` types.
