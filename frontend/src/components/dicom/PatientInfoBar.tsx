"use client";

const C = {
    surface: "#161B22",
    border: "#30363D",
    borderLight: "#484F58",
    text: "#F0F6FC",
    textMuted: "#C9D1D9",
    textFaint: "#8B949E",
    accent: "#00D1FF",
};

interface Props {
    patientName: string;
    patientId: string;
    gender: string;
    age: number;
    studyDate: string;
    modality: string;
    bodyPart: string;
    seriesCount: number;
    imageCount: number;
}

function Item({
                  title,
                  value,
              }: {
    title: string;
    value: string | number;
}) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 120,
            }}
        >
            <span
                style={{
                    color: C.textFaint,
                    fontSize: 11,
                    marginBottom: 4,
                }}
            >
                {title}
            </span>

            <span
                style={{
                    color: C.text,
                    fontSize: 14,
                    fontWeight: 600,
                }}
            >
                {value}
            </span>
        </div>
    );
}

export default function PatientInfoBar({
                                           patientName,
                                           patientId,
                                           gender,
                                           age,
                                           studyDate,
                                           modality,
                                           bodyPart,
                                           seriesCount,
                                           imageCount,
                                       }: Props) {

    return (

        <div

            style={{

                height: 74,

                background: C.surface,

                borderBottom: `1px solid ${C.border}`,

                display: "flex",

                alignItems: "center",

                justifyContent: "space-between",

                padding: "0 24px"

            }}

        >

            <div
                style={{
                    display: "flex",
                    gap: 36,
                }}
            >
                <Item
                    title="환자명"
                    value={patientName}
                />

                <Item
                    title="Patient ID"
                    value={patientId}
                />

                <Item
                    title="성별"
                    value={gender}
                />

                <Item
                    title="나이"
                    value={`${age}세`}
                />

                <Item
                    title="검사일"
                    value={studyDate}
                />

                <Item
                    title="Modality"
                    value={modality}
                />

                <Item
                    title="Body Part"
                    value={bodyPart}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 28,
                    alignItems: "center",
                }}
            >
                <div>

                    <span
                        style={{
                            color: C.textFaint,
                            fontSize: 11,
                        }}
                    >
                        Series
                    </span>

                    <div
                        style={{
                            color: C.accent,
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        {seriesCount}
                    </div>

                </div>

                <div>

                    <span
                        style={{
                            color: C.textFaint,
                            fontSize: 11,
                        }}
                    >
                        Images
                    </span>

                    <div
                        style={{
                            color: C.accent,
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        {imageCount}
                    </div>

                </div>

            </div>

        </div>

    );

}