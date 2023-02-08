"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PlanspotComponent = exports.PLANSPOT_KEY = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var common_class_1 = require("../../class/common.class");
var indexeddb_class_1 = require("../../class/indexeddb.class");
var mypageplanlist_class_1 = require("../../class/mypageplanlist.class");
var planspotlist_class_1 = require("../../class/planspotlist.class");
var user_class_1 = require("../../class/user.class");
var common_1 = require("@angular/common");
var search_dialog_component_1 = require("./components/search-dialog/search-dialog.component");
var planspot_list_component_1 = require("./components/planspot-list/planspot-list.component");
var http_1 = require("@angular/common/http");
var user_dialog_component_1 = require("src/app/parts/user-dialog/user-dialog.component");
var platform_browser_1 = require("@angular/platform-browser");
exports.PLANSPOT_KEY = platform_browser_1.makeStateKey('PLANSPOT_KEY');
var PlanspotComponent = /** @class */ (function () {
    function PlanspotComponent(translate, commonService, planspots, activatedRoute, indexedDBService, gaService, myplanService, transferState, router, dialog, animationDialog, platformId) {
        this.translate = translate;
        this.commonService = commonService;
        this.planspots = planspots;
        this.activatedRoute = activatedRoute;
        this.indexedDBService = indexedDBService;
        this.gaService = gaService;
        this.myplanService = myplanService;
        this.transferState = transferState;
        this.router = router;
        this.dialog = dialog;
        this.animationDialog = animationDialog;
        this.platformId = platformId;
        this.onDestroy$ = new rxjs_1.Subject();
        this.source = [];
        this.rows = [];
        this.spots = [];
        this.plans = [];
        this.details$ = [];
        this.count = 0;
        this.result = [];
        this.p = 1;
        this.isList = true;
        this["switch"] = false;
        this.codec = new http_1.HttpUrlEncodingCodec();
        this.isBrowser = false;
        this.limit = 124;
        this.p = 1;
        this.condition = new indexeddb_class_1.ListSearchCondition();
        this.isBrowser = common_1.isPlatformBrowser(this.platformId);
    }
    Object.defineProperty(PlanspotComponent.prototype, "lang", {
        get: function () {
            return this.translate.currentLang;
        },
        enumerable: false,
        configurable: true
    });
    PlanspotComponent.prototype.ngAfterViewChecked = function () {
        if (typeof this.offset !== 'undefined') {
            if (this.list.isMobile) {
                if (this.offset > 0) {
                    window.scrollTo(0, this.offset);
                }
                if (this.offset === window.pageYOffset) {
                    this.offset = 0;
                }
            }
            else {
                if (this.offset > 0) {
                    this.list.box.nativeElement.scrollTo(0, this.offset);
                    this.offset = 0;
                }
            }
        }
    };
    PlanspotComponent.prototype.cacheRecoveryDataSet = function () {
        var cache = this.transferState.get(exports.PLANSPOT_KEY, null);
        console.log(cache);
        this.rows = cache.data;
        this.spots = cache.spots;
        this.plans = cache.plans;
        this.end = cache.end;
        this.offset = cache.offset;
        this.details$ = cache.data.filter(function (d) { return d.pictures.length > 0; });
        this.p = cache.p - 1;
        this.$mSort = cache.mSort;
        this.count = cache.data.length;
        this.isList = cache.isList; //change
        this.listSelectMaster = cache.ListSelectMaster;
        this.optionKeywords = cache.optionKeywords;
        this.searchParams = cache.searchParams;
        if (cache.planSpotList) {
            this.onViewUserPost(cache.planSpotList);
        }
        this.transferState.remove(exports.PLANSPOT_KEY);
        this.condition = JSON.parse(sessionStorage.getItem(this.planspots.conditionSessionKey));
        this.historyReplace(this.searchParams);
    };
    PlanspotComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, condition_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.commonService.getGuid()];
                    case 1:
                        _a.guid = _b.sent();
                        if (this.transferState.hasKey(exports.PLANSPOT_KEY)) {
                            this.cacheRecoveryDataSet();
                        }
                        else {
                            condition_1 = new indexeddb_class_1.ListSearchCondition();
                            this.activatedRoute.queryParams
                                .pipe(operators_1.takeUntil(this.onDestroy$))
                                .subscribe(function (params) { return __awaiter(_this, void 0, void 0, function () {
                                var result, filterResult;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if ((params.aid && params.aid.length > 0) ||
                                                (params.era && params.era.length > 0) ||
                                                (params.cat && params.cat.length > 0) ||
                                                (params.srt && params.srt.length > 0) ||
                                                (params.lst && params.lst.length > 0) ||
                                                (params.kwd && params.kwd.length > 0)) {
                                                condition_1.areaId =
                                                    params.aid && params.aid.length > 0
                                                        ? params.aid.split(',').map(Number)
                                                        : [];
                                                condition_1.areaId2 =
                                                    params.era && params.era.length > 0
                                                        ? params.era.split(',').map(Number)
                                                        : [];
                                                condition_1.searchCategories =
                                                    params.cat && params.cat.length > 0
                                                        ? params.cat.split(',').map(Number)
                                                        : [];
                                                condition_1.searchOptions =
                                                    params.opt && params.opt.length > 0
                                                        ? params.opt.split(',').map(Number)
                                                        : [];
                                                condition_1.sortval = params.srt;
                                                condition_1.select = params.lst;
                                                condition_1.keyword = params.kwd;
                                                if (this.isBrowser) {
                                                    sessionStorage.setItem(this.planspots.conditionSessionKey, JSON.stringify(condition_1));
                                                }
                                            }
                                            else if (this.isBrowser &&
                                                sessionStorage.getItem(this.planspots.conditionSessionKey)) {
                                                condition_1 = JSON.parse(sessionStorage.getItem(this.planspots.conditionSessionKey));
                                            }
                                            result = [];
                                            result.push(new Promise(function (resolve) {
                                                _this.planspots
                                                    .getPlanSpotListSearchCondition()
                                                    .pipe(operators_1.takeUntil(_this.onDestroy$))
                                                    .subscribe(function (r) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        this.listSelectMaster = r;
                                                        this.$mSort = r.mSort;
                                                        resolve(true);
                                                        return [2 /*return*/];
                                                    });
                                                }); });
                                            }));
                                            result.push(new Promise(function (resolve) {
                                                _this.planspots
                                                    .getPlanList()
                                                    .pipe(operators_1.takeUntil(_this.onDestroy$))
                                                    .subscribe(function (r) {
                                                    _this.plans = r;
                                                    resolve(true);
                                                });
                                            }));
                                            result.push(new Promise(function (resolve) {
                                                _this.planspots
                                                    .getSpotList()
                                                    .pipe(operators_1.takeUntil(_this.onDestroy$))
                                                    .subscribe(function (r) {
                                                    _this.spots = r;
                                                    resolve(true);
                                                });
                                            }));
                                            return [4 /*yield*/, Promise.all(result)];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, this.planspots.getFilterbyCondition(this.spots.concat(this.plans), condition_1)];
                                        case 2:
                                            filterResult = _a.sent();
                                            if (filterResult.length === 0 && condition_1.keyword) {
                                                condition_1.select = 'google';
                                                if (this.isBrowser) {
                                                    sessionStorage.setItem(this.planspots.conditionSessionKey, JSON.stringify(condition_1));
                                                }
                                            }
                                            this.condition = condition_1;
                                            this.filteringData();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        this.myplanService.FetchMyplanSpots();
                        this.myplanService.MySpots$.subscribe(function (r) {
                            _this.myPlanSpots = r;
                        });
                        this.myplanService.PlanUserSaved$.pipe(operators_1.takeUntil(this.onDestroy$)).subscribe(function (x) {
                            var idx = _this.details$.findIndex(function (v) { return v.isPlan === true && v.id === x.planUserId; });
                            if (idx > -1) {
                                _this.planspots
                                    .fetchDetails(_this.details$[idx], _this.guid)
                                    .pipe(operators_1.takeUntil(_this.onDestroy$))
                                    .subscribe(function (d) { return __awaiter(_this, void 0, void 0, function () {
                                    var _a, _b;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                _a = this.rows;
                                                _b = idx;
                                                return [4 /*yield*/, this.planspots.mergeDetail(this.rows[idx], d)];
                                            case 1:
                                                _a[_b] = _c.sent();
                                                this.details$ = this.rows.slice(0, this.end);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                            }
                        });
                        this.planspots.searchSubject.subscribe(function (r) {
                            _this.condition = r;
                            sessionStorage.setItem(_this.planspots.conditionSessionKey, JSON.stringify(_this.condition));
                            _this.filteringData();
                        });
                        this.myplanService.updFavirute$
                            .pipe(operators_1.takeUntil(this.onDestroy$))
                            .subscribe(function (x) {
                            var spot, spotDetail;
                            if (x.type === 1) {
                                spot = _this.rows.find(function (planSpot) {
                                    return planSpot.isPlan === false &&
                                        planSpot.id === x.spotId &&
                                        !planSpot.googleSpot;
                                });
                                spotDetail = _this.details$.find(function (planSpot) {
                                    return planSpot.isPlan === false &&
                                        planSpot.id === x.spotId &&
                                        !planSpot.googleSpot;
                                });
                            }
                            else {
                                spotDetail = _this.details$.find(function (planSpot) {
                                    return planSpot.isPlan === false &&
                                        planSpot.googleSpot.google_spot_id === x.spotId;
                                });
                            }
                            if (spot) {
                                spot.isFavorite = x.isFavorite;
                            }
                            if (spotDetail) {
                                spotDetail.isFavorite = x.isFavorite;
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    PlanspotComponent.prototype.ngOnDestroy = function () {
        this.onDestroy$.next();
    };
    PlanspotComponent.prototype.onScrollDown = function () {
        this.mergeNextDataSet();
    };
    PlanspotComponent.prototype.filteringData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.planspots.filteringData(this.spots.concat(this.plans), this.condition, this.listSelectMaster)];
                    case 1:
                        result = _a.sent();
                        if (this.isBrowser) {
                            this.offset = 0;
                            this.commonService.scrollToTop();
                        }
                        this.p = 1;
                        this.prevkeyword = null;
                        this.token = null;
                        this.rows = result.list;
                        this.details$ = [];
                        this.optionKeywords = result.searchTarm;
                        this.searchParams = result.searchParams;
                        this.historyReplace(result.searchParams);
                        if (this.condition.select !== 'google') {
                            this.count = result.list.length;
                        }
                        this.mergeNextDataSet();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlanspotComponent.prototype.mergeNextDataSet = function (isDetail) {
        if (isDetail === void 0) { isDetail = false; }
        return __awaiter(this, void 0, void 0, function () {
            var startIndex_1, _loop_1, this_1, i, state_1, keyword_1;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.rows.length > 0) {
                    this.isList = true;
                    startIndex_1 = (this.p - 1) * this.limit;
                    this.end = startIndex_1 + this.limit;
                    if (startIndex_1 === 0) {
                        this.loading = true;
                    }
                    else {
                        this.loading = false;
                    }
                    if (this.rows.length - startIndex_1 < this.limit) {
                        this.end = this.rows.length;
                    }
                    if (isDetail) {
                        startIndex_1 = 0;
                    }
                    if (!this["switch"]) {
                        _loop_1 = function (i) {
                            if (this_1.rows[i].isDetail) {
                                this_1.details$ = this_1.rows.slice(0, this_1.end);
                                this_1.loading = false;
                                return { value: void 0 };
                            }
                            this_1.planspots
                                .fetchDetails(this_1.rows[i], this_1.guid)
                                .pipe(operators_1.takeUntil(this_1.onDestroy$))
                                .subscribe(function (d) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (!d) return [3 /*break*/, 4];
                                            if (!d.isEndOfPublication) return [3 /*break*/, 1];
                                            this.rows.splice(i, 1);
                                            if (this.rows.length - startIndex_1 < this.limit) {
                                                this.end = this.rows.length;
                                            }
                                            return [3 /*break*/, 3];
                                        case 1:
                                            _a = this.rows;
                                            _b = i;
                                            return [4 /*yield*/, this.planspots.mergeDetail(this.rows[i], d)];
                                        case 2:
                                            _a[_b] = _c.sent();
                                            _c.label = 3;
                                        case 3:
                                            this.details$ = this.rows.slice(0, this.end);
                                            this.loading = false;
                                            _c.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); });
                        };
                        this_1 = this;
                        for (i = startIndex_1; i < this.end; i++) {
                            state_1 = _loop_1(i);
                            if (typeof state_1 === "object")
                                return [2 /*return*/, state_1.value];
                        }
                        this.p++;
                    }
                    else {
                        this.details$ = this.rows.slice(0, this.end);
                        this.loading = false;
                        console.log(this.details$);
                    }
                }
                else if (this.condition.select === 'google') {
                    this.isList = false;
                    keyword_1 = this.condition.keyword;
                    if (this.prevkeyword !== keyword_1) {
                        this.details$ = [];
                    }
                    if (keyword_1 &&
                        ((this.prevkeyword === keyword_1 && this.token) ||
                            this.prevkeyword !== keyword_1)) {
                        this.planspots
                            .getGoogleSpotList(this.guid, keyword_1, this.token)
                            .pipe(operators_1.takeUntil(this.onDestroy$))
                            .subscribe(function (g) {
                            console.log(g);
                            _this.prevkeyword = keyword_1;
                            _this.details$ = _this.details$.concat(g.planSpotList);
                            _this.token = g.tokenGoogle;
                            _this.loading = false;
                        });
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    PlanspotComponent.prototype.historyReplace = function (searchParams) {
        if (common_1.isPlatformBrowser(this.platformId)) {
            if (searchParams.length > 19) {
                history.replaceState('search_key', '', location.pathname.substring(0) + '?' + searchParams);
            }
            else {
                history.replaceState('search_key', '', location.pathname.substring(0));
            }
        }
    };
    // キーワード検索
    PlanspotComponent.prototype.keywordSearch = function (v) {
        return __awaiter(this, void 0, void 0, function () {
            var condition, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // this.gaService.sendEvent(
                        //   'planspotlist',
                        //   this.condition.select,
                        //   'search',
                        //   v
                        // );
                        this.condition.keyword = v;
                        this.prevkeyword = null;
                        this.token = null;
                        if (!!v) return [3 /*break*/, 1];
                        this.condition.select = 'all';
                        return [3 /*break*/, 3];
                    case 1:
                        condition = __assign({}, this.condition);
                        condition.select = 'all';
                        return [4 /*yield*/, this.planspots.getFilterbyCondition(this.spots.concat(this.plans), condition)];
                    case 2:
                        result = _a.sent();
                        if (result.length > 0) {
                            this.condition.select = 'all';
                        }
                        else {
                            this.condition.select = 'google';
                        }
                        _a.label = 3;
                    case 3:
                        sessionStorage.setItem(this.planspots.conditionSessionKey, JSON.stringify(this.condition));
                        this.filteringData();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 表示順
    PlanspotComponent.prototype.sortChange = function (v) {
        //this.gaService.sendEvent('planspotlist', this.condition.select, 'sort', v);
        this.condition.sortval = v;
        sessionStorage.setItem(this.planspots.conditionSessionKey, JSON.stringify(this.condition));
        this.filteringData();
    };
    // プランスポット切り替え
    PlanspotComponent.prototype.onPlanSpotChange = function (val) {
        //google analysticはcutする
        //this.gaService.sendEvent('planspotlist', val, 'tab', null);
        this.condition.select = val;
        sessionStorage.setItem(this.planspots.conditionSessionKey, JSON.stringify(this.condition));
        this["switch"] = true;
        this.filteringData();
    };
    // プラン/スポット詳細リンク
    PlanspotComponent.prototype.linktoDetail = function (item) {
        //this.gaService.sendEvent('planspotlist', this.condition.select, 'detail', item.id);
        this.setTransferState();
        if (item.isPlan) {
            this.router.navigate(['/' + this.lang + '/plans/detail', item.id]);
        }
        else if (item.googleSpot) {
            this.commonService.locationPlaceIdGoogleMap(this.lang, item.googleSpot.latitude, item.googleSpot.longitude, item.googleSpot.place_id);
        }
        else {
            this.router.navigate(['/' + this.lang + '/spots/detail', item.id]);
        }
    };
    PlanspotComponent.prototype.setTransferState = function (planSpotList) {
        if (planSpotList === void 0) { planSpotList = null; }
        try {
            var _offset = void 0;
            if (this.list.isMobile) {
                _offset = window.pageYOffset;
            }
            else {
                _offset = this.list.scrollPos;
            }
            var c = new planspotlist_class_1.CacheStore();
            c.data = this.rows;
            c.spots = this.spots;
            c.plans = this.plans;
            c.details$ = this.details$;
            c.p = this.p;
            c.end = this.end;
            c.offset = _offset;
            c.mSort = this.$mSort;
            c.isList = this.isList;
            c.ListSelectMaster = this.listSelectMaster;
            c.optionKeywords = this.optionKeywords;
            c.searchParams = this.searchParams;
            c.planSpotList = planSpotList;
            this.transferState.set(exports.PLANSPOT_KEY, c);
        }
        catch (error) {
            //
        }
    };
    // 検索パネル(エリア・カテゴリー選択)
    PlanspotComponent.prototype.openDialog = function (e) {
        // this.gaService.sendEvent(
        //   'planspotlist',
        //   this.condition.select,
        //   'search_dialog',
        //   e
        // );
        var _this = this;
        this.listSelectMaster.tabIndex = e;
        this.listSelectMaster.isGoogle = this.condition.select === 'google';
        this.listSelectMaster.planSpotList = this.spots.concat(this.plans);
        var dialogRef = this.dialog.open(search_dialog_component_1.SearchDialogComponent, {
            maxWidth: '100%',
            width: '92vw',
            position: { top: '10px' },
            data: this.listSelectMaster,
            autoFocus: false,
            id: 'searchDialog'
        });
        dialogRef
            .afterClosed()
            .pipe(operators_1.takeUntil(this.onDestroy$))
            .subscribe(function (condition) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (condition !== 'cancel') {
                    // ローカル変数配列の重複除外
                    condition.areaId = Array.from(new Set(condition.areaId));
                    condition.areaId2 = Array.from(new Set(condition.areaId2));
                    this.condition = condition;
                    sessionStorage.setItem(this.planspots.conditionSessionKey, JSON.stringify(this.condition));
                    this.filteringData();
                }
                return [2 /*return*/];
            });
        }); });
    };
    // 検索条件リセット
    PlanspotComponent.prototype.conditionReset = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.commonService.scrollToTop();
                if (this.condition.select === 'google') {
                    this.condition.select = 'all';
                }
                this.condition.areaId = [];
                this.condition.areaId2 = [];
                this.condition.searchCategories = [];
                this.condition.keyword = '';
                sessionStorage.setItem(this.planspots.conditionSessionKey, JSON.stringify(this.condition));
                this.filteringData();
                return [2 /*return*/];
            });
        });
    };
    // プランに追加
    PlanspotComponent.prototype.addMyPlan = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var tempqty, param, dialog;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tempqty = item.isPlan ? item.spotQty : 1;
                        return [4 /*yield*/, this.commonService.checkAddPlan(tempqty)];
                    case 1:
                        if ((_a.sent()) === false) {
                            param = new common_class_1.ComfirmDialogParam();
                            param.text = 'ErrorMsgAddSpot';
                            param.leftButton = 'EditPlanProgress';
                            dialog = this.commonService.confirmMessageDialog(param);
                            dialog
                                .afterClosed()
                                .pipe(operators_1.takeUntil(this.onDestroy$))
                                .subscribe(function (d) {
                                if (d === 'ok') {
                                    // 編集中のプランを表示
                                    _this.commonService.onNotifyIsShowCart(true);
                                }
                            });
                            return [2 /*return*/];
                        }
                        this.planspots
                            .addPlan(item.id, item.isPlan, this.guid, item.isRemojuPlan, item.googleSpot ? true : false, item.googleSpot)
                            .then(function (result) {
                            result.pipe(operators_1.takeUntil(_this.onDestroy$)).subscribe(function (myPlanApp) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (myPlanApp) {
                                        this.myplanService.onPlanUserChanged(myPlanApp);
                                        this.indexedDBService.registPlan(myPlanApp);
                                        this.myplanService.FetchMyplanSpots();
                                    }
                                    return [2 /*return*/];
                                });
                            }); });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    // お気に入り登録・除外
    PlanspotComponent.prototype.setFavorite = function (item) {
        // this.gaService.sendEvent(
        //   'planspotlist',
        //   this.condition.select,
        //   item.isFavorite ? 'favorite_off' : 'favorite_on',
        //   item.id
        // );
        item.isFavorite = !item.isFavorite;
        if (!item.isPlan) {
            var param = new mypageplanlist_class_1.UpdFavorite();
            param.spotId = item.id;
            param.type = item.googleSpot ? 2 : 1;
            param.isFavorite = item.isFavorite;
            this.myplanService.updateFavorite(param);
        }
        this.planspots
            .registFavorite(item.id, item.isPlan, item.isFavorite, item.isRemojuPlan, this.guid, item.googleSpot ? true : false, item.googleSpot)
            .pipe(operators_1.takeUntil(this.onDestroy$))
            .subscribe(function () {
            //this.mypageFavoriteListService.GetFavoriteCount(this.guid);
        });
    };
    PlanspotComponent.prototype.onViewUserPost = function (item) {
        // this.gaService.sendEvent(
        //   'planspotlist',
        //   this.condition.select,
        //   'view_user',
        //   item.user.objectId
        // );
        this.setTransferState(item);
        var param = new user_class_1.UserPlanData();
        param.user = item.user;
        param.userPlanSpotList = item.userPlanList;
        this.dialog.open(user_dialog_component_1.UserDialogComponent, {
            id: 'userpost',
            maxWidth: '100%',
            width: this.list.isMobile ? '92vw' : '50vw',
            position: { top: '12px' },
            data: param,
            autoFocus: false
        });
    };
    __decorate([
        core_1.ViewChild(planspot_list_component_1.PlanspotListComponent)
    ], PlanspotComponent.prototype, "list");
    PlanspotComponent = __decorate([
        core_1.Component({
            selector: 'app-planspot',
            templateUrl: './planspot.component.html',
            styleUrls: ['./planspot.component.scss']
        }),
        __param(11, core_1.Inject(core_1.PLATFORM_ID))
    ], PlanspotComponent);
    return PlanspotComponent;
}());
exports.PlanspotComponent = PlanspotComponent;
