import { useEffect, useState } from 'react';

type Category = 'APARTMENT' | 'OFFICE_TEL' | 'COMMUNITY_FACILITY' | 'COMMERCIAL_FACILITY' | 'RETAIL_FACILITY';
const Category: { [key in Category]: Category } = {
    APARTMENT: 'APARTMENT', // 아파트
    OFFICE_TEL: 'OFFICE_TEL', // 오피스텔
    COMMUNITY_FACILITY: 'COMMUNITY_FACILITY', // 부대 복리 시설
    COMMERCIAL_FACILITY: 'COMMERCIAL_FACILITY', // 근린 생활 시설
    RETAIL_FACILITY: 'RETAIL_FACILITY', // 판매 시설
};

type FunnelStep = 'CATEGORY_STEP' | 'BUILDING_COUNT_STEP' | 'FACILITY_CHECK_STEP';
const FunnelStep: {
    [key in FunnelStep]: FunnelStep;
} = {
    CATEGORY_STEP: 'CATEGORY_STEP',
    BUILDING_COUNT_STEP: 'BUILDING_COUNT_STEP',
    FACILITY_CHECK_STEP: 'FACILITY_CHECK_STEP',
};

function App() {
    const [step, setStep] = useState<FunnelStep>('CATEGORY_STEP');
    const [category, setCategory] = useState<Category | ''>('');
    const [buildingCount, setBuildingCount] = useState<number>(1);

    useEffect(() => {
        if (category === '') {
            setStep(FunnelStep.CATEGORY_STEP);
            return;
        }
        if (shouldShowBuildingCountStep(category)) {
            setStep(FunnelStep.BUILDING_COUNT_STEP);
            return;
        } else {
            setStep(FunnelStep.FACILITY_CHECK_STEP);
            return;
        }
    }, [category]);

    function shouldShowBuildingCountStep(category: Category | '') {
        if (category === '') return false;
        return [Category.APARTMENT, Category.OFFICE_TEL].includes(category);
    }

    function shouldShowFacilityStep(category: Category | '') {
        if (category === '') return false;
        return [Category.COMMUNITY_FACILITY, Category.COMMERCIAL_FACILITY, Category.RETAIL_FACILITY].includes(category);
    }

    return (
        <section className={'flex flex-col min-w-[100vw] min-h-screen py-20 items-center gap-10 justify-start'}>
            <h1>건축 개요</h1>
            <div className={'flex flex-col gap-4'}>
                <CategorySelector onClick={() => setStep(FunnelStep.CATEGORY_STEP)} isOpen={step === FunnelStep.CATEGORY_STEP} selected={category} onSelect={setCategory} />
                <BuildingCountSelector
                    onClick={() => setStep(FunnelStep.BUILDING_COUNT_STEP)}
                    isOpen={step === FunnelStep.BUILDING_COUNT_STEP}
                    isRender={shouldShowBuildingCountStep(category)}
                    buildingCount={buildingCount}
                    onSubmit={(count) => {
                        setBuildingCount(count);
                        setStep(FunnelStep.FACILITY_CHECK_STEP);
                    }}
                />
                <FacilityChecker isOpen={step === FunnelStep.FACILITY_CHECK_STEP} isRender={shouldShowFacilityStep(category)} />
            </div>
        </section>
    );
}

const FacilityChecker = ({ isOpen, isRender }: { isOpen: boolean; isRender: boolean }) => {
    const [selectedFacilities, setSelectedFacilities] = useState<FacilityInfo[]>([]);

    if (!isRender) return <></>;
    if (!isOpen) return <div>선택된 부대 시설:</div>;

    const Facilities = getFacilitiesByCategory();

    console.log(Facilities);
    return (
        <div>
            <label>부대 시설을 선택해주세요.</label>
            <div className={'flex flex-col gap-4'}>
                {Object.keys(Facilities).map((category) => (
                    <div key={category} className={'flex gap-4'}>
                        <b>{category}</b>
                        <div className={'flex flex-col gap-1'}>
                            {Facilities[category as FacilityCategory].map((facility: FacilityInfo) => {
                                const isChecked = selectedFacilities.includes(facility);

                                return (
                                    <div key={facility.id} className={'flex gap-1'}>
                                        <input
                                            id={facility.id}
                                            type={'checkbox'}
                                            checked={isChecked}
                                            onChange={() => {
                                                if (isChecked) {
                                                    setSelectedFacilities(selectedFacilities.filter((item) => item.id !== facility.id));
                                                } else {
                                                    setSelectedFacilities([...selectedFacilities, facility]);
                                                }
                                            }}
                                        />
                                        <label htmlFor={facility.id}>{facility.name}</label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BuildingCountSelector = ({
    buildingCount,
    onSubmit,
    isOpen,
    isRender,
    onClick,
}: {
    onClick: () => void;
    isOpen: boolean;
    isRender: boolean;
    buildingCount: number;
    onSubmit: (value: number) => void;
}) => {
    const [count, setCount] = useState<number>(buildingCount);

    if (!isRender) return <></>;
    if (!isOpen) return <div onClick={onClick}>선택된 동 갯수: {count}</div>;

    return (
        <div className={'flex flex-col gap-2'}>
            <label>몇개의 동을 작성하시나요?</label>
            <input type={'number'} value={count} onChange={(event) => setCount(Number(event.target.value))} />
            <button onClick={() => onSubmit(count)}>확인</button>
        </div>
    );
};

const CategorySelector = ({ isOpen, selected, onSelect, onClick }: { isOpen: boolean; selected: Category | ''; onSelect: (value: Category | '') => void; onClick: () => void }) => {
    const CategoryNameObject = {
        APARTMENT: '아파트',
        OFFICE_TEL: '오피스텔',
        COMMUNITY_FACILITY: '부대 복리 시설',
        COMMERCIAL_FACILITY: '근린 생활 시설',
        RETAIL_FACILITY: '판매 시설',
    };

    const getCategoryName = (category: Category): string => {
        return CategoryNameObject[category];
    };

    if (!isOpen && selected !== '') return <div onClick={onClick}>선택된 카테고리: {getCategoryName(selected)}</div>;

    return (
        <div className={'flex flex-col items-center gap-2'}>
            <label>구분을 선택해주세요.</label>
            <select
                value={selected}
                onChange={(event) => {
                    onSelect(event.target.value as Category);
                }}
            >
                {Object.values(Category).map((category) => (
                    <option key={category} value={category}>
                        {getCategoryName(category)}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default App;

// 시설 카테고리 타입 정의
type FacilityCategory = '주차시설' | '기계설비시설' | '전기통신시설' | '주민편의시설' | '관리시설' | '기타시설';

// 시설 정보 인터페이스
interface FacilityInfo {
    id: string;
    name: string;
    category: FacilityCategory;
    description?: string;
}

// 시설 아이템 객체
export const FACILITY_ITEMS: Record<string, FacilityInfo> = {
    UNDERGROUND_PARKING: {
        id: 'UNDERGROUND_PARKING',
        name: '지하주차장',
        category: '주차시설',
        description: '건물 지하에 설치된 주차 공간',
    },
    GROUND_PARKING: {
        id: 'GROUND_PARKING',
        name: '지상주차장',
        category: '주차시설',
        description: '건물 외부에 설치된 주차 공간',
    },
    PUMP_ROOM: {
        id: 'PUMP_ROOM',
        name: '펌프실',
        category: '기계설비시설',
        description: '급수 설비가 설치된 공간',
    },
    ELECTRIC_ROOM: {
        id: 'ELECTRIC_ROOM',
        name: '전기실',
        category: '전기통신시설',
        description: '전기 설비가 설치된 공간',
    },
    MACHINE_ROOM: {
        id: 'MACHINE_ROOM',
        name: '기계실',
        category: '기계설비시설',
        description: '기계 설비가 설치된 공간',
    },
    GENERATOR_ROOM: {
        id: 'GENERATOR_ROOM',
        name: '발전기실',
        category: '전기통신시설',
        description: '비상 발전 설비가 설치된 공간',
    },
    VENTILATION_ROOM: {
        id: 'VENTILATION_ROOM',
        name: '제연휀룸',
        category: '기계설비시설',
        description: '화재 시 연기 배출을 위한 설비가 설치된 공간',
    },
    COMMUNICATION_ROOM: {
        id: 'COMMUNICATION_ROOM',
        name: '통신실',
        category: '전기통신시설',
        description: '통신 설비가 설치된 공간',
    },
    COMMUNITY_FACILITY: {
        id: 'COMMUNITY_FACILITY',
        name: '주민공동시설',
        category: '주민편의시설',
        description: '주민들의 공동 활동을 위한 공간',
    },
    MANAGEMENT_OFFICE: {
        id: 'MANAGEMENT_OFFICE',
        name: '관리사무소',
        category: '관리시설',
        description: '건물 관리를 위한 사무 공간',
    },
    STAFF_LOUNGE: {
        id: 'STAFF_LOUNGE',
        name: '용역원휴게실',
        category: '관리시설',
        description: '관리 직원들을 위한 휴게 공간',
    },
    DISASTER_PREVENTION_ROOM: {
        id: 'DISASTER_PREVENTION_ROOM',
        name: '방재실,MDF실',
        category: '전기통신시설',
        description: '재난 방지 및 통신 설비가 설치된 공간',
    },
    EXERCISE_FACILITY: {
        id: 'EXERCISE_FACILITY',
        name: '주민운동시설',
        category: '주민편의시설',
        description: '주민들의 운동을 위한 공간',
    },
    OUTDOOR_STAIRS: {
        id: 'OUTDOOR_STAIRS',
        name: '옥외계단',
        category: '기타시설',
        description: '건물 외부에 설치된 계단',
    },
    STORAGE: {
        id: 'STORAGE',
        name: '세대창고',
        category: '기타시설',
        description: '각 세대별 물품 보관을 위한 공간',
    },
    SECURITY_OFFICE: {
        id: 'SECURITY_OFFICE',
        name: '경비실',
        category: '관리시설',
        description: '건물 보안을 위한 공간',
    },
    NEIGHBORHOOD_FACILITY: {
        id: 'NEIGHBORHOOD_FACILITY',
        name: '근린생활시설',
        category: '기타시설',
        description: '주민 생활 편의를 위한 상업 시설',
    },
} as const;

// 카테고리별로 시설을 그룹화하는 헬퍼 함수
export const getFacilitiesByCategory = () => {
    return Object.values(FACILITY_ITEMS).reduce(
        (acc, facility) => {
            const { category } = facility;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(facility);
            return acc;
        },
        {} as Record<FacilityCategory, FacilityInfo[]>,
    );
};
