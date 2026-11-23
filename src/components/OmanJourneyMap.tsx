import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Check, Compass, Globe, Loader2, MapPin, Navigation } from 'lucide-react';
import { GovernorateStop } from '../data/journeyData';
import { toEasternArabic } from '../utils/arabicNumbers';

interface OmanJourneyMapProps {
  stops: GovernorateStop[];
  activeIndex: number;
  completedStops: Record<string, boolean>;
  onSelectStop: (index: number) => void;
}

interface ResolvedPlace {
  lat: number;
  lng: number;
  displayName: string;
}

interface CachedRoute {
  path: Array<{ lat: number; lng: number }>;
  distanceMeters: number;
  durationMillis: number;
}

const MAPS_API_KEY: string =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  (typeof __GOOGLE_MAPS_KEY__ !== 'undefined' ? __GOOGLE_MAPS_KEY__ : '');

const COORDS_CACHE_KEY = 'oman_gov_coords_v1';
const ROUTES_CACHE_KEY = 'oman_gov_routes_v1';

// نقطة ارتكاز جغرافية مبدئية قبل اكتمال تحميل إحداثيات المحافظات من Places API
const INITIAL_VIEW_CENTER = { lat: 21.5, lng: 56.0 };

function isQuotaError(err: unknown): boolean {
  const text = err instanceof Error ? err.message : String(err);
  return (
    text.includes('RESOURCE_EXHAUSTED') ||
    text.includes('OVER_QUERY_LIMIT') ||
    text.includes('429') ||
    text.includes('OverQuota')
  );
}

function formatArabicDuration(durationMillis: number): string {
  const totalMinutes = Math.max(1, Math.round(durationMillis / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) {
    return `${toEasternArabic(mins)} دقيقة`;
  }
  if (mins === 0) {
    return `${toEasternArabic(hours)} ساعة`;
  }
  return `${toEasternArabic(hours)} س ${toEasternArabic(mins)} د`;
}

function computeBearing(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLng = b.lng - a.lng;
  const dLat = b.lat - a.lat;
  const angleRad = Math.atan2(dLng, dLat);
  return (angleRad * 180) / Math.PI;
}

interface GovernorateMarkerProps {
  stop: GovernorateStop;
  position: ResolvedPlace;
  isActive: boolean;
  isDone: boolean;
  isInfoOpen: boolean;
  onMarkerClick: () => void;
  onCloseInfo: () => void;
}

const GovernorateMarker: React.FC<GovernorateMarkerProps> = ({
  stop,
  position,
  isActive,
  isDone,
  isInfoOpen,
  onMarkerClick,
  onCloseInfo,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: position.lat, lng: position.lng }}
        onClick={onMarkerClick}
        zIndex={isActive ? 30 : 10}
        title={`${toEasternArabic(stop.order)}. ${stop.governorateName}`}
      >
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 shadow-md transition-transform cursor-pointer select-none ${
            isActive
              ? 'bg-[#0F766E] text-white border-white scale-110'
              : isDone
              ? 'bg-emerald-700 text-white border-white hover:scale-105'
              : 'bg-white text-[#1C2430] border-[#0F766E] hover:scale-105'
          }`}
        >
          <span className="text-xs font-bold tabular-nums leading-none">
            {isDone && !isActive ? (
              <Check className="w-3 h-3 inline" strokeWidth={3} />
            ) : (
              toEasternArabic(stop.order)
            )}
          </span>
          <span className="text-[11px] font-bold whitespace-nowrap leading-none">
            {stop.shortName}
          </span>
        </div>
      </AdvancedMarker>

      {isInfoOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={onCloseInfo} maxWidth={260}>
          <div dir="rtl" className="p-1 text-right space-y-1.5 font-sans">
            <div className="text-xs font-bold text-[#0F766E]">
              المحطة {toEasternArabic(stop.order)} · {stop.cityOrLandmark}
            </div>
            <div className="text-sm font-extrabold text-[#1C2430]">{stop.governorateName}</div>
            <p className="text-xs text-[#526071] leading-relaxed">{stop.heritageSummary}</p>
            <div className="pt-1 border-t border-stone-200 text-[11px] font-semibold text-[#B45309]">
              عنصر الحصة: {stop.lessonElement}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface MapLayerProps {
  stops: GovernorateStop[];
  activeIndex: number;
  completedStops: Record<string, boolean>;
  onSelectStop: (index: number) => void;
  onRouteInfoChange: (info: { distanceKm: number; durationText: string } | null) => void;
  onResolutionStatus: (status: { loading: boolean; error: string | null }) => void;
  fitAllTrigger: number;
}

const OmanMapLayer: React.FC<MapLayerProps> = ({
  stops,
  activeIndex,
  completedStops,
  onSelectStop,
  onRouteInfoChange,
  onResolutionStatus,
  fitAllTrigger,
}) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');

  const [locations, setLocations] = useState<Record<string, ResolvedPlace>>(() => {
    try {
      const saved = sessionStorage.getItem(COORDS_CACHE_KEY);
      return saved ? (JSON.parse(saved) as Record<string, ResolvedPlace>) : {};
    } catch {
      return {};
    }
  });

  const [openInfoId, setOpenInfoId] = useState<string | null>(null);
  const [carPose, setCarPose] = useState<{ lat: number; lng: number; heading: number } | null>(null);

  const prevIndexRef = useRef<number>(activeIndex);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const animFrameRef = useRef<number>(0);
  const locationsRef = useRef<Record<string, ResolvedPlace>>(locations);
  locationsRef.current = locations;

  // ١) جلب إحداثيات المحافظات الثماني الحقيقية عبر Places API (New)
  useEffect(() => {
    if (!placesLib) return;

    const initialLocations = locationsRef.current;
    const allResolved = stops.every((s) => Boolean(initialLocations[s.id]));
    if (allResolved) {
      onResolutionStatus({ loading: false, error: null });
      return;
    }

    let cancelled = false;
    onResolutionStatus({ loading: true, error: null });

    const resolveAll = async () => {
      const resolvedMap: Record<string, ResolvedPlace> = { ...initialLocations };
      try {
        for (const stop of stops) {
          if (resolvedMap[stop.id]) continue;
          const { places } = await placesLib.Place.searchByText({
            textQuery: stop.searchQuery,
            fields: ['location', 'displayName'],
            language: 'ar',
            region: 'om',
            maxResultCount: 1,
          });

          const place = places?.[0];
          if (place?.location) {
            resolvedMap[stop.id] = {
              lat: place.location.lat(),
              lng: place.location.lng(),
              displayName: place.displayName || stop.governorateName,
            };
          }
        }

        if (!cancelled) {
          setLocations(resolvedMap);
          try {
            sessionStorage.setItem(COORDS_CACHE_KEY, JSON.stringify(resolvedMap));
          } catch {
            // تجاهل أخطاء التخزين المؤقت
          }
          onResolutionStatus({ loading: false, error: null });
        }
      } catch (err) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          onResolutionStatus({
            loading: false,
            error: 'تعذر تحميل إحداثيات بعض المحافظات على الخريطة الحقيقية. تحقق من الاتصال أو الحصة.',
          });
        }
      }
    };

    resolveAll();
    return () => {
      cancelled = true;
    };
  }, [placesLib, stops, onResolutionStatus]);

  // ٢) ضبط حدود الخريطة على جميع محافظات السلطنة عند الاكتمال أو عند طلب المستخدم
  const fitAllGovernorates = useCallback(() => {
    if (!map) return;
    const coords = Object.values(locations);
    if (coords.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    coords.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
    map.fitBounds(bounds, { top: 45, right: 45, bottom: 45, left: 45 });
  }, [map, locations]);

  const didInitialFitRef = useRef(false);
  useEffect(() => {
    if (!didInitialFitRef.current && Object.keys(locations).length >= stops.length && map) {
      didInitialFitRef.current = true;
      fitAllGovernorates();
      const firstLoc = locations[stops[activeIndex].id];
      if (firstLoc) {
        setCarPose({ lat: firstLoc.lat, lng: firstLoc.lng, heading: -45 });
      }
    }
  }, [locations, stops, map, activeIndex, fitAllGovernorates]);

  useEffect(() => {
    if (fitAllTrigger > 0) {
      fitAllGovernorates();
    }
  }, [fitAllTrigger, fitAllGovernorates]);

  // ٣) رسم المسار الحقيقي وتحريك السيارة بين المحافظات عبر Routes API (Route.computeRoutes)
  useEffect(() => {
    if (!map) return;
    const targetStop = stops[activeIndex];
    const targetLoc = locations[targetStop.id];
    if (!targetLoc) return;

    const prevIdx = prevIndexRef.current;
    const prevStop = stops[prevIdx];
    const prevLoc = prevStop ? locations[prevStop.id] : undefined;
    prevIndexRef.current = activeIndex;

    // تنظيف أي مسارات سابقة
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (!prevLoc || prevIdx === activeIndex) {
      setCarPose((cur) => cur ?? { lat: targetLoc.lat, lng: targetLoc.lng, heading: -45 });
      onRouteInfoChange(null);
      return;
    }

    const animateCarAlongPath = (pathPoints: Array<{ lat: number; lng: number }>) => {
      if (pathPoints.length === 0) return;

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced || pathPoints.length === 1) {
        const last = pathPoints[pathPoints.length - 1];
        const prev = pathPoints[Math.max(0, pathPoints.length - 2)];
        setCarPose({
          lat: last.lat,
          lng: last.lng,
          heading: pathPoints.length > 1 ? computeBearing(prev, last) : 0,
        });
        return;
      }

      const startTime = performance.now();
      const duration = 1100;

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const exactIndex = eased * (pathPoints.length - 1);
        const idx = Math.min(pathPoints.length - 2, Math.floor(exactIndex));
        const frac = exactIndex - idx;
        const p1 = pathPoints[idx];
        const p2 = pathPoints[idx + 1] ?? p1;

        const lat = p1.lat + (p2.lat - p1.lat) * frac;
        const lng = p1.lng + (p2.lng - p1.lng) * frac;
        const heading = computeBearing(p1, p2);

        setCarPose({ lat, lng, heading });

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    };

    const drawPolylineAndAnimate = (cached: CachedRoute) => {
      const polyline = new google.maps.Polyline({
        path: cached.path,
        geodesic: true,
        strokeColor: '#0F766E',
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map,
      });
      polylinesRef.current = [polyline];

      const bounds = new google.maps.LatLngBounds();
      cached.path.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { top: 55, right: 55, bottom: 55, left: 55 });

      if (cached.distanceMeters > 0) {
        onRouteInfoChange({
          distanceKm: Math.round(cached.distanceMeters / 1000),
          durationText: formatArabicDuration(cached.durationMillis),
        });
      } else {
        onRouteInfoChange(null);
      }

      animateCarAlongPath(cached.path);
    };

    const segmentKey = `${prevStop.id}->${targetStop.id}`;
    try {
      const cacheRaw = sessionStorage.getItem(ROUTES_CACHE_KEY);
      const cacheObj = cacheRaw ? (JSON.parse(cacheRaw) as Record<string, CachedRoute>) : {};
      if (cacheObj[segmentKey]) {
        drawPolylineAndAnimate(cacheObj[segmentKey]);
        return;
      }
    } catch {
      // تجاهل أخطاء القراءة
    }

    if (!routesLib) {
      drawPolylineAndAnimate({
        path: [
          { lat: prevLoc.lat, lng: prevLoc.lng },
          { lat: targetLoc.lat, lng: targetLoc.lng },
        ],
        distanceMeters: 0,
        durationMillis: 0,
      });
      return;
    }

    let cancelled = false;

    routesLib.Route.computeRoutes({
      origin: { lat: prevLoc.lat, lng: prevLoc.lng },
      destination: { lat: targetLoc.lat, lng: targetLoc.lng },
      travelMode: routesLib.TravelMode.DRIVING,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    })
      .then(({ routes }) => {
        if (cancelled) return;
        const primaryRoute = routes?.[0];
        if (!primaryRoute || !primaryRoute.path || primaryRoute.path.length === 0) {
          drawPolylineAndAnimate({
            path: [
              { lat: prevLoc.lat, lng: prevLoc.lng },
              { lat: targetLoc.lat, lng: targetLoc.lng },
            ],
            distanceMeters: 0,
            durationMillis: 0,
          });
          return;
        }

        const nativePolylines = primaryRoute.createPolylines({
          polylineOptions: {
            strokeColor: '#0F766E',
            strokeOpacity: 0.9,
            strokeWeight: 5,
          },
        });
        nativePolylines.forEach((p) => p.setMap(map));
        polylinesRef.current = nativePolylines;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, { top: 55, right: 55, bottom: 55, left: 55 });
        }

        const rawPath = primaryRoute.path.map((pt) => ({
          lat: typeof pt.lat === 'function' ? (pt as unknown as google.maps.LatLng).lat() : pt.lat,
          lng: typeof pt.lng === 'function' ? (pt as unknown as google.maps.LatLng).lng() : pt.lng,
        }));

        // تقليل نقاط الحركة إلى حد مناسب لسلاسة الأنيميشن والتخزين المؤقت
        const maxSampled = 80;
        const stepSize = Math.max(1, Math.floor(rawPath.length / maxSampled));
        const sampledPath = rawPath.filter((_, i) => i % stepSize === 0 || i === rawPath.length - 1);

        const routeData: CachedRoute = {
          path: sampledPath,
          distanceMeters: primaryRoute.distanceMeters ?? 0,
          durationMillis: primaryRoute.durationMillis ?? 0,
        };

        try {
          const cacheRaw = sessionStorage.getItem(ROUTES_CACHE_KEY);
          const cacheObj = cacheRaw ? (JSON.parse(cacheRaw) as Record<string, CachedRoute>) : {};
          cacheObj[segmentKey] = routeData;
          sessionStorage.setItem(ROUTES_CACHE_KEY, JSON.stringify(cacheObj));
        } catch {
          // تجاهل أخطاء التخزين
        }

        if (routeData.distanceMeters > 0) {
          onRouteInfoChange({
            distanceKm: Math.round(routeData.distanceMeters / 1000),
            durationText: formatArabicDuration(routeData.durationMillis),
          });
        } else {
          onRouteInfoChange(null);
        }

        animateCarAlongPath(sampledPath);
      })
      .catch((err) => {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          drawPolylineAndAnimate({
            path: [
              { lat: prevLoc.lat, lng: prevLoc.lng },
              { lat: targetLoc.lat, lng: targetLoc.lng },
            ],
            distanceMeters: 0,
            durationMillis: 0,
          });
        }
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activeIndex, locations, map, routesLib, stops, onRouteInfoChange]);

  return (
    <>
      {stops.map((stop, idx) => {
        const pos = locations[stop.id];
        if (!pos) return null;
        return (
          <GovernorateMarker
            key={stop.id}
            stop={stop}
            position={pos}
            isActive={idx === activeIndex}
            isDone={Boolean(completedStops[stop.id])}
            isInfoOpen={openInfoId === stop.id}
            onMarkerClick={() => {
              setOpenInfoId(stop.id);
              onSelectStop(idx);
            }}
            onCloseInfo={() => setOpenInfoId(null)}
          />
        );
      })}

      {carPose && (
        <AdvancedMarker
          position={{ lat: carPose.lat, lng: carPose.lng }}
          zIndex={50}
          title="السيارة التعليمية"
        >
          <div
            style={{ transform: `rotate(${carPose.heading}deg)` }}
            className="transition-transform duration-75 drop-shadow-md"
          >
            <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="18" r="16" fill="#B45309" fillOpacity="0.18" />
              <rect
                x="10.5"
                y="5"
                width="15"
                height="26"
                rx="4.5"
                fill="#B45309"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <rect x="12.5" y="12" width="11" height="12" rx="2" fill="#FEF3C7" />
              <path d="M 13 10 L 23 10 L 22 7.5 L 14 7.5 Z" fill="#0F172A" fillOpacity="0.85" />
              <circle cx="13.5" cy="6.2" r="1.3" fill="#FDE047" />
              <circle cx="22.5" cy="6.2" r="1.3" fill="#FDE047" />
            </svg>
          </div>
        </AdvancedMarker>
      )}
    </>
  );
};

const ApiStatusOverlay: React.FC<{ resolutionLoading: boolean; resolutionError: string | null }> = ({
  resolutionLoading,
  resolutionError,
}) => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 p-4 text-center">
        <div className="max-w-sm space-y-2">
          <p className="text-sm font-bold text-rose-800">تعذر تحميل خرائط Google</p>
          <p className="text-xs text-[#526071]">
            تحقق من صلاحية مفتاح الخرائط أو إعدادات الحصة في المشروع.
          </p>
        </div>
      </div>
    );
  }

  if (status === APILoadingStatus.LOADING || resolutionLoading) {
    return (
      <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-white/95 border border-stone-200 shadow-xs flex items-center gap-2 text-xs font-semibold text-[#1C2430]">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F766E]" />
        <span>جارٍ تحميل خريطة سلطنة عُمان الحقيقية...</span>
      </div>
    );
  }

  if (resolutionError) {
    return (
      <div className="absolute bottom-3 right-3 left-3 z-20 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
        {resolutionError}
      </div>
    );
  }

  return null;
};

export const OmanJourneyMap: React.FC<OmanJourneyMapProps> = ({
  stops,
  activeIndex,
  completedStops,
  onSelectStop,
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid' | 'terrain'>('roadmap');
  const [fitAllTrigger, setFitAllTrigger] = useState(0);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationText: string } | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<{ loading: boolean; error: string | null }>({
    loading: true,
    error: null,
  });

  const activeStop = stops[activeIndex];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* رأس الخريطة */}
      <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#526071]">
            <Compass className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>خريطة سلطنة عُمان الحقيقية (Google Maps)</span>
          </div>
          <h2 className="text-lg font-bold text-[#1C2430] mt-0.5">
            المحطة {toEasternArabic(activeStop.order)} من {toEasternArabic(stops.length)}:{' '}
            {activeStop.governorateName}
          </h2>
        </div>
        <div className="text-left text-xs text-[#526071] tabular-nums shrink-0">
          المنجز:{' '}
          <span className="font-bold text-[#0F766E]">
            {toEasternArabic(Object.values(completedStops).filter(Boolean).length)}
          </span>{' '}
          / {toEasternArabic(stops.length)}
        </div>
      </div>

      {/* الخريطة الحقيقية وشريط الأدوات */}
      <div className="bg-[#FAF9F6] border-b border-stone-200">
        {/* أدوات نوع الخريطة وإظهار كل السلطنة */}
        <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-white">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-stone-100 border border-stone-200">
            {[
              { id: 'roadmap' as const, label: 'خريطة' },
              { id: 'terrain' as const, label: 'تضاريس' },
              { id: 'hybrid' as const, label: 'قمر صناعي' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMapType(t.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mapType === t.id
                    ? 'bg-white text-[#0F766E] shadow-xs'
                    : 'text-[#526071] hover:text-[#1C2430]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setFitAllTrigger((c) => c + 1)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stone-200 bg-[#FAF9F6] text-[#1C2430] hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>عرض كل السلطنة</span>
          </button>
        </div>

        {/* حاوية الخريطة بارتفاع صريح (CF2) */}
        <div className="relative w-full h-[340px] sm:h-[370px] bg-stone-100">
          {!MAPS_API_KEY ? (
            <div className="w-full h-full flex items-center justify-center p-6 text-center">
              <div className="max-w-xs space-y-2">
                <p className="text-sm font-bold text-[#1C2430]">مفتاح خرائط Google غير مهيأ</p>
                <p className="text-xs text-[#526071]">
                  يرجى التأكد من تفعيل مفتاح Google Maps Platform في إعدادات المشروع.
                </p>
              </div>
            </div>
          ) : (
            <APIProvider
              apiKey={MAPS_API_KEY}
              language="ar"
              region="OM"
              libraries={['places', 'routes', 'marker']}
            >
              <GoogleMap
                mapId="DEMO_MAP_ID"
                defaultCenter={INITIAL_VIEW_CENTER}
                defaultZoom={6}
                mapTypeId={mapType}
                gestureHandling="greedy"
                streetViewControl={false}
                mapTypeControl={false}
                fullscreenControl={true}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                <OmanMapLayer
                  stops={stops}
                  activeIndex={activeIndex}
                  completedStops={completedStops}
                  onSelectStop={onSelectStop}
                  onRouteInfoChange={setRouteInfo}
                  onResolutionStatus={setResolutionStatus}
                  fitAllTrigger={fitAllTrigger}
                />
              </GoogleMap>
              <ApiStatusOverlay
                resolutionLoading={resolutionStatus.loading}
                resolutionError={resolutionStatus.error}
              />
            </APIProvider>
          )}
        </div>

        {/* معلومات مسار السيارة الحقيقي + شريط اختيار المحطات */}
        <div className="px-3 py-2.5 space-y-2 bg-[#EFF6F5] border-t border-stone-200">
          {routeInfo && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#1C2430] px-1">
              <Navigation className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
              <span className="font-semibold">مسار القيادة الفعلي:</span>
              <span className="tabular-nums text-[#0F766E] font-bold">
                {toEasternArabic(routeInfo.distanceKm)} كم
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums text-[#526071]">الزمن التقريبي: {routeInfo.durationText}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {stops.map((stop, idx) => {
              const isActive = idx === activeIndex;
              const isDone = Boolean(completedStops[stop.id]);
              return (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => onSelectStop(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#0F766E] text-white'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white text-[#526071] border border-stone-200 hover:text-[#1C2430]'
                  }`}
                >
                  <span className="tabular-nums">{toEasternArabic(stop.order)}.</span>
                  <span>{stop.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* بطاقة ما تتميز به المحافظة الحالية */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#526071]">
            <MapPin className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
            <span>{activeStop.cityOrLandmark}</span>
            <span aria-hidden="true">·</span>
            <span>{activeStop.strategy}</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#1C2430]">
              بما تتميز به {activeStop.governorateName}
            </h3>
            <p className="text-sm text-[#526071] leading-relaxed mt-1">{activeStop.heritageSummary}</p>
          </div>

          <div className="text-xs text-[#1C2430] pt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-[#B45309]">أبرز المعالم:</span>
            {activeStop.heritageHighlights.map((item, idx) => (
              <React.Fragment key={item}>
                <span>{item}</span>
                {idx < activeStop.heritageHighlights.length - 1 && (
                  <span className="text-stone-400" aria-hidden="true">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#526071]">
          <span>عنصر الحصة في هذه المحطة:</span>
          <span className="font-bold text-[#0F766E]">{activeStop.lessonElement}</span>
        </div>
      </div>
    </div>
  );
};
