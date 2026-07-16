"use client";

import {
    addTool,
    ToolGroupManager,
    WindowLevelTool,
    PanTool,
    ZoomTool,
    StackScrollTool,
    LengthTool,
    AngleTool,
    Enums,
} from "@cornerstonejs/tools";

let toolGroup: any = null;
let initialized = false;

export function initTools(
    viewportId: string,
    renderingEngineId: string
) {

    if (!initialized) {

        addTool(WindowLevelTool);
        addTool(PanTool);
        addTool(ZoomTool);
        addTool(StackScrollTool);
        addTool(LengthTool);
        addTool(AngleTool);

        initialized = true;
    }

    const groupId = "dicom-tools";

    toolGroup = ToolGroupManager.getToolGroup(groupId);


    if (!toolGroup) {

        toolGroup =
            ToolGroupManager.createToolGroup(groupId);

        toolGroup.addTool(WindowLevelTool.toolName);
        toolGroup.addTool(PanTool.toolName);
        toolGroup.addTool(ZoomTool.toolName);
        toolGroup.addTool(StackScrollTool.toolName);
        toolGroup.addTool(LengthTool.toolName);
        toolGroup.addTool(AngleTool.toolName);
    }

    try {

        const viewports =
            toolGroup.getViewportIds();

        if (!viewports.includes(viewportId)) {

            toolGroup.addViewport(
                viewportId,
                renderingEngineId
            );

        }

    } catch(error){

        console.warn(
            "viewport add failed",
            error
        );

    }

    toolGroup.setToolActive(
        StackScrollTool.toolName,
        {
            bindings: [
                {
                    mouseButton:
                    Enums.MouseBindings.Wheel
                }
            ]
        }
    );

}

export function activateTool(tool: string)

    {


    if (!toolGroup)
        return;

    toolGroup.setToolPassive(
        WindowLevelTool.toolName
    );

    toolGroup.setToolPassive(
        PanTool.toolName
    );

    toolGroup.setToolPassive(
        ZoomTool.toolName
    );

    toolGroup.setToolPassive(
        LengthTool.toolName
    );

    toolGroup.setToolPassive(
        AngleTool.toolName
    );

    toolGroup.setToolPassive(
        StackScrollTool.toolName
    );

    switch (tool) {

        case "window":

            toolGroup.setToolActive(
                WindowLevelTool.toolName,
                {
                    bindings: [
                        {
                            mouseButton:
                            Enums.MouseBindings.Primary
                        }
                    ]
                }
            );
            break;

        case "pan":

            toolGroup.setToolActive(
                PanTool.toolName,
                {
                    bindings: [
                        {
                            mouseButton:
                            Enums.MouseBindings.Primary
                        }
                    ]
                }
            );
            break;

        case "zoom":

            toolGroup.setToolActive(
                ZoomTool.toolName,
                {
                    bindings: [
                        {
                            mouseButton:
                            Enums.MouseBindings.Primary
                        }
                    ]
                }
            );
            break;

        case "length":

            toolGroup.setToolActive(
                LengthTool.toolName,
                {
                    bindings: [
                        {
                            mouseButton:
                            Enums.MouseBindings.Primary
                        }
                    ]
                }
            );

            break;

            case "angle":

                toolGroup.setToolActive(
                    AngleTool.toolName,
                    {
                        bindings:[
                            {
                                mouseButton:
                                Enums.MouseBindings.Primary
                            }
                        ]
                    }
                );

                break;

            case "roi":

                toolGroup.setToolPassive(
                    WindowLevelTool.toolName
                );

                toolGroup.setToolPassive(
                    StackScrollTool.toolName
                );

                break;

            }

        toolGroup.setToolActive(
            StackScrollTool.toolName,
            {
                bindings: [
                    {
                        mouseButton:
                        Enums.MouseBindings.Wheel
                    }
                ]
            }
        );
}